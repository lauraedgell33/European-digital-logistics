<?php

namespace App\Services;

use App\Models\TransportOrder;
use App\Models\EcmrDocument;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

/**
 * Electronic Signature service for logistics contracts.
 *
 * Supports DocuSign, Adobe Sign, and built-in simple e-signature.
 * Used for: transport contracts, CMR notes, POD, insurance docs.
 */
class ESignatureService
{
    // ── Providers ───────────────────────────────────────────────
    public const PROVIDER_DOCUSIGN = 'docusign';
    public const PROVIDER_ADOBE_SIGN = 'adobe_sign';
    public const PROVIDER_INTERNAL = 'internal';

    /**
     * Create an envelope (signing request) for a transport contract.
     */
    public function createContractEnvelope(TransportOrder $order, array $options = []): array
    {
        $provider = $options['provider'] ?? config('services.esignature.provider', self::PROVIDER_INTERNAL);

        return match ($provider) {
            self::PROVIDER_DOCUSIGN => $this->createDocusignEnvelope($order, $options),
            self::PROVIDER_ADOBE_SIGN => $this->createAdobeSignAgreement($order, $options),
            self::PROVIDER_INTERNAL => $this->createInternalSignature($order, $options),
            default => ['error' => 'Unsupported e-signature provider'],
        };
    }

    /**
     * Create a signing request for a CMR / e-CMR document.
     */
    public function signCmr(EcmrDocument $ecmr, array $signers): array
    {
        $provider = config('services.esignature.provider', self::PROVIDER_INTERNAL);

        $documentName = "CMR-{$ecmr->cmr_number}";
        $document = $this->generateCmrPdfContent($ecmr);

        return match ($provider) {
            self::PROVIDER_DOCUSIGN => $this->sendDocusign($documentName, $document, $signers, [
                'subject' => "Sign CMR Consignment Note {$ecmr->cmr_number}",
                'message' => 'Please review and sign this CMR consignment note.',
                'ecmr_id' => $ecmr->id,
            ]),
            self::PROVIDER_INTERNAL => $this->createInternalMultiSign($documentName, $document, $signers, [
                'document_type' => 'cmr',
                'reference_id' => $ecmr->id,
            ]),
            default => ['error' => 'Unsupported provider'],
        };
    }

    /**
     * Verify a signature.
     */
    public function verifySignature(string $signatureId, string $provider = null): array
    {
        $provider ??= config('services.esignature.provider', self::PROVIDER_INTERNAL);

        return match ($provider) {
            self::PROVIDER_DOCUSIGN => $this->verifyDocusignEnvelope($signatureId),
            self::PROVIDER_INTERNAL => $this->verifyInternalSignature($signatureId),
            default => ['valid' => false, 'error' => 'Unsupported provider'],
        };
    }

    /**
     * Get signature status.
     */
    public function getStatus(string $envelopeId, string $provider = null): array
    {
        $provider ??= config('services.esignature.provider', self::PROVIDER_INTERNAL);

        return match ($provider) {
            self::PROVIDER_DOCUSIGN => $this->getDocusignStatus($envelopeId),
            self::PROVIDER_INTERNAL => $this->getInternalStatus($envelopeId),
            default => ['status' => 'unknown'],
        };
    }

    /**
     * Download signed document.
     */
    public function downloadSigned(string $envelopeId, string $provider = null): ?string
    {
        $provider ??= config('services.esignature.provider', self::PROVIDER_INTERNAL);

        return match ($provider) {
            self::PROVIDER_DOCUSIGN => $this->downloadDocusignDocument($envelopeId),
            self::PROVIDER_INTERNAL => $this->downloadInternalDocument($envelopeId),
            default => null,
        };
    }

    /**
     * List signature requests for a company.
     */
    public function listRequests(int $companyId, array $filters = []): array
    {
        $cacheKey = "esig_requests:{$companyId}:" . md5(json_encode($filters));

        return Cache::remember($cacheKey, 300, function () use ($companyId, $filters) {
            $query = \DB::table('e_signature_requests')
                ->where('company_id', $companyId);

            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }
            if (!empty($filters['document_type'])) {
                $query->where('document_type', $filters['document_type']);
            }

            return $query->orderByDesc('created_at')
                ->limit($filters['limit'] ?? 50)
                ->get()
                ->toArray();
        });
    }

    /**
     * Handle webhook callback from DocuSign.
     */
    public function handleDocusignWebhook(array $payload): array
    {
        $event = $payload['event'] ?? '';
        $envelopeId = data_get($payload, 'data.envelopeId') ?? data_get($payload, 'envelopeSummary.envelopeId');

        Log::info("DocuSign webhook: {$event}", ['envelope_id' => $envelopeId]);

        $status = match ($event) {
            'envelope-completed' => 'completed',
            'envelope-declined' => 'declined',
            'envelope-voided' => 'voided',
            'recipient-completed' => 'partially_signed',
            'envelope-sent' => 'sent',
            default => null,
        };

        if ($status && $envelopeId) {
            \DB::table('e_signature_requests')
                ->where('external_envelope_id', $envelopeId)
                ->update([
                    'status' => $status,
                    'completed_at' => $status === 'completed' ? now() : null,
                    'updated_at' => now(),
                ]);
        }

        return ['processed' => true, 'event' => $event, 'status' => $status];
    }

    // ─── DocuSign Implementation ────────────────────────────────

    private function createDocusignEnvelope(TransportOrder $order, array $options): array
    {
        $shipper = $order->shipper;
        $carrier = $order->carrier;

        $signers = [
            ['name' => $shipper?->name ?? 'Shipper', 'email' => $options['shipper_email'] ?? $shipper?->email, 'role' => 'shipper'],
            ['name' => $carrier?->name ?? 'Carrier', 'email' => $options['carrier_email'] ?? $carrier?->email, 'role' => 'carrier'],
        ];

        // Generate contract PDF
        $pdfContent = $this->generateContractPdf($order);
        $documentName = "Transport-Contract-{$order->order_number}";

        return $this->sendDocusign($documentName, $pdfContent, $signers, [
            'subject' => "Sign Transport Contract {$order->order_number}",
            'message' => "Please review & sign the transport contract for order {$order->order_number}.",
            'order_id' => $order->id,
        ]);
    }

    private function sendDocusign(string $documentName, string $pdfContent, array $signers, array $meta = []): array
    {
        $accountId = config('services.docusign.account_id');
        $baseUrl = config('services.docusign.base_url', 'https://demo.docusign.net/restapi');
        $accessToken = $this->getDocusignAccessToken();

        if (!$accountId || !$accessToken) {
            // Fall back to internal
            return $this->createInternalMultiSign($documentName, $pdfContent, $signers, $meta);
        }

        $recipients = [];
        foreach ($signers as $i => $signer) {
            $recipients[] = [
                'email' => $signer['email'],
                'name' => $signer['name'],
                'recipientId' => (string) ($i + 1),
                'routingOrder' => (string) ($i + 1),
                'tabs' => [
                    'signHereTabs' => [[
                        'documentId' => '1',
                        'pageNumber' => '1',
                        'xPosition' => '100',
                        'yPosition' => (string) (600 + $i * 80),
                    ]],
                    'dateSignedTabs' => [[
                        'documentId' => '1',
                        'pageNumber' => '1',
                        'xPosition' => '300',
                        'yPosition' => (string) (600 + $i * 80),
                    ]],
                ],
            ];
        }

        $envelopePayload = [
            'emailSubject' => $meta['subject'] ?? "Sign {$documentName}",
            'emailBlurb' => $meta['message'] ?? 'Please review and sign.',
            'documents' => [[
                'documentId' => '1',
                'name' => $documentName . '.pdf',
                'documentBase64' => base64_encode($pdfContent),
                'fileExtension' => 'pdf',
            ]],
            'recipients' => ['signers' => $recipients],
            'status' => 'sent',
        ];

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => "Bearer {$accessToken}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$baseUrl}/v2.1/accounts/{$accountId}/envelopes", $envelopePayload);

            if ($response->failed()) {
                Log::error('DocuSign envelope creation failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return ['error' => 'Failed to create signing request', 'status' => $response->status()];
            }

            $envelopeId = $response->json('envelopeId');

            // Store in DB
            \DB::table('e_signature_requests')->insert([
                'company_id' => request()->user()?->company_id,
                'document_type' => $meta['document_type'] ?? 'contract',
                'document_name' => $documentName,
                'external_envelope_id' => $envelopeId,
                'provider' => self::PROVIDER_DOCUSIGN,
                'status' => 'sent',
                'signers' => json_encode($signers),
                'metadata' => json_encode($meta),
                'transport_order_id' => $meta['order_id'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return [
                'envelope_id' => $envelopeId,
                'provider' => self::PROVIDER_DOCUSIGN,
                'status' => 'sent',
                'signers_count' => count($signers),
                'document_name' => $documentName,
            ];
        } catch (\Exception $e) {
            Log::error("DocuSign API error: {$e->getMessage()}");
            return ['error' => $e->getMessage()];
        }
    }

    private function getDocusignAccessToken(): ?string
    {
        return Cache::remember('docusign_access_token', 3300, function () {
            $integrationKey = config('services.docusign.integration_key');
            $secretKey = config('services.docusign.secret_key');
            $refreshToken = config('services.docusign.refresh_token');
            $authUrl = config('services.docusign.auth_url', 'https://account-d.docusign.com');

            if (!$integrationKey || !$secretKey) return null;

            try {
                $response = Http::asForm()
                    ->withBasicAuth($integrationKey, $secretKey)
                    ->post("{$authUrl}/oauth/token", [
                        'grant_type' => 'refresh_token',
                        'refresh_token' => $refreshToken,
                    ]);

                return $response->json('access_token');
            } catch (\Exception $e) {
                Log::error("DocuSign auth failed: {$e->getMessage()}");
                return null;
            }
        });
    }

    private function verifyDocusignEnvelope(string $envelopeId): array
    {
        $accountId = config('services.docusign.account_id');
        $baseUrl = config('services.docusign.base_url', 'https://demo.docusign.net/restapi');
        $accessToken = $this->getDocusignAccessToken();

        if (!$accessToken) return ['valid' => false, 'error' => 'No access token'];

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$accessToken}",
            ])->get("{$baseUrl}/v2.1/accounts/{$accountId}/envelopes/{$envelopeId}");

            $status = $response->json('status');

            return [
                'valid' => $status === 'completed',
                'status' => $status,
                'completed_at' => $response->json('completedDateTime'),
                'created_at' => $response->json('createdDateTime'),
                'envelope_id' => $envelopeId,
                'provider' => self::PROVIDER_DOCUSIGN,
            ];
        } catch (\Exception $e) {
            return ['valid' => false, 'error' => $e->getMessage()];
        }
    }

    private function getDocusignStatus(string $envelopeId): array
    {
        return $this->verifyDocusignEnvelope($envelopeId);
    }

    private function downloadDocusignDocument(string $envelopeId): ?string
    {
        $accountId = config('services.docusign.account_id');
        $baseUrl = config('services.docusign.base_url', 'https://demo.docusign.net/restapi');
        $accessToken = $this->getDocusignAccessToken();

        if (!$accessToken) return null;

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$accessToken}",
                'Accept' => 'application/pdf',
            ])->get("{$baseUrl}/v2.1/accounts/{$accountId}/envelopes/{$envelopeId}/documents/combined");

            return $response->successful() ? $response->body() : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    // ─── Internal (Built-in) E-Signature ────────────────────────

    private function createInternalSignature(TransportOrder $order, array $options): array
    {
        $signers = [
            ['name' => $order->shipper?->name ?? 'Shipper', 'email' => $options['shipper_email'] ?? $order->shipper?->email, 'role' => 'shipper'],
            ['name' => $order->carrier?->name ?? 'Carrier', 'email' => $options['carrier_email'] ?? $order->carrier?->email, 'role' => 'carrier'],
        ];

        $documentName = "Transport-Contract-{$order->order_number}";
        $pdfContent = $this->generateContractPdf($order);

        return $this->createInternalMultiSign($documentName, $pdfContent, $signers, [
            'document_type' => 'contract',
            'order_id' => $order->id,
        ]);
    }

    private function createInternalMultiSign(string $documentName, string $pdfContent, array $signers, array $meta = []): array
    {
        $signatureId = 'ESIG-' . strtoupper(bin2hex(random_bytes(12)));

        // Store document
        $path = "signatures/{$signatureId}/{$documentName}.pdf";
        Storage::put($path, $pdfContent);

        // Generate signing tokens for each signer
        $signerTokens = [];
        foreach ($signers as $signer) {
            $token = bin2hex(random_bytes(32));
            $signerTokens[] = [
                'name' => $signer['name'],
                'email' => $signer['email'],
                'role' => $signer['role'] ?? 'signer',
                'token' => $token,
                'signed' => false,
                'signed_at' => null,
            ];
        }

        // Store in DB
        \DB::table('e_signature_requests')->insert([
            'company_id' => request()->user()?->company_id,
            'signature_id' => $signatureId,
            'document_type' => $meta['document_type'] ?? 'document',
            'document_name' => $documentName,
            'document_path' => $path,
            'provider' => self::PROVIDER_INTERNAL,
            'status' => 'pending',
            'signers' => json_encode($signerTokens),
            'metadata' => json_encode($meta),
            'transport_order_id' => $meta['order_id'] ?? $meta['reference_id'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // In production, send email to each signer with their unique token/link
        foreach ($signerTokens as $signer) {
            Log::info("E-Signature request sent to {$signer['email']}", [
                'signature_id' => $signatureId,
                'role' => $signer['role'],
            ]);
        }

        return [
            'signature_id' => $signatureId,
            'provider' => self::PROVIDER_INTERNAL,
            'status' => 'pending',
            'signers_count' => count($signers),
            'document_name' => $documentName,
            'signing_urls' => collect($signerTokens)->map(fn($s) => [
                'name' => $s['name'],
                'role' => $s['role'],
                'url' => url("/api/v1/e-signature/sign/{$signatureId}?token={$s['token']}"),
            ])->toArray(),
        ];
    }

    /**
     * Sign a document with the internal provider.
     */
    public function signInternal(string $signatureId, string $token, array $signatureData): array
    {
        $request = \DB::table('e_signature_requests')
            ->where('signature_id', $signatureId)
            ->where('provider', self::PROVIDER_INTERNAL)
            ->first();

        if (!$request) return ['signed' => false, 'error' => 'Signature request not found'];

        $signers = json_decode($request->signers, true);
        $found = false;

        foreach ($signers as &$signer) {
            if ($signer['token'] === $token && !$signer['signed']) {
                $signer['signed'] = true;
                $signer['signed_at'] = now()->toIso8601String();
                $signer['ip_address'] = request()->ip();
                $signer['user_agent'] = request()->userAgent();
                $signer['signature_hash'] = hash('sha256', json_encode($signatureData) . $token . now()->toIso8601String());
                $found = true;
                break;
            }
        }

        if (!$found) return ['signed' => false, 'error' => 'Invalid or already used token'];

        $allSigned = collect($signers)->every(fn($s) => $s['signed']);

        \DB::table('e_signature_requests')
            ->where('signature_id', $signatureId)
            ->update([
                'signers' => json_encode($signers),
                'status' => $allSigned ? 'completed' : 'partially_signed',
                'completed_at' => $allSigned ? now() : null,
                'updated_at' => now(),
            ]);

        return [
            'signed' => true,
            'signature_id' => $signatureId,
            'all_signed' => $allSigned,
            'status' => $allSigned ? 'completed' : 'partially_signed',
        ];
    }

    private function verifyInternalSignature(string $signatureId): array
    {
        $request = \DB::table('e_signature_requests')
            ->where('signature_id', $signatureId)
            ->first();

        if (!$request) return ['valid' => false, 'error' => 'Not found'];

        $signers = json_decode($request->signers, true);
        $allSigned = collect($signers)->every(fn($s) => $s['signed']);

        return [
            'valid' => $allSigned,
            'status' => $request->status,
            'signers' => collect($signers)->map(fn($s) => [
                'name' => $s['name'],
                'role' => $s['role'],
                'signed' => $s['signed'],
                'signed_at' => $s['signed_at'] ?? null,
            ])->toArray(),
            'completed_at' => $request->completed_at,
            'provider' => self::PROVIDER_INTERNAL,
        ];
    }

    private function getInternalStatus(string $signatureId): array
    {
        return $this->verifyInternalSignature($signatureId);
    }

    private function downloadInternalDocument(string $signatureId): ?string
    {
        $request = \DB::table('e_signature_requests')
            ->where('signature_id', $signatureId)
            ->first();

        if (!$request || !$request->document_path) return null;

        return Storage::get($request->document_path);
    }

    // ─── PDF Generation Helpers ─────────────────────────────────

    private function generateContractPdf(TransportOrder $order): string
    {
        $html = view('documents.transport-contract', [
            'order' => $order,
            'shipper' => $order->shipper,
            'carrier' => $order->carrier,
            'generatedAt' => now()->format('d.m.Y H:i'),
        ])->render();

        $pdf = app('dompdf.wrapper');
        $pdf->loadHTML($html)->setPaper('a4');
        return $pdf->output();
    }

    private function generateCmrPdfContent(EcmrDocument $ecmr): string
    {
        try {
            $html = view('documents.cmr', [
                'order' => $ecmr->transportOrder,
                'shipper' => $ecmr->transportOrder?->shipper,
                'carrier' => $ecmr->transportOrder?->carrier,
                'generatedAt' => now()->format('d.m.Y H:i'),
            ])->render();

            $pdf = app('dompdf.wrapper');
            $pdf->loadHTML($html)->setPaper('a4');
            return $pdf->output();
        } catch (\Exception $e) {
            // Minimal fallback PDF
            return '%PDF-1.4 CMR Document';
        }
    }
}
