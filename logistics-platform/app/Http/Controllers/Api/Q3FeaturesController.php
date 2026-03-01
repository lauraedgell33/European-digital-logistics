<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ESignatureService;
use App\Services\EuMobilityComplianceService;
use App\Services\CarbonFootprintCalculatorService;
use App\Models\TransportOrder;
use App\Models\EcmrDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Unified Q3 controller for E-Signatures, EU Compliance, and Enhanced Carbon Calculator.
 */
class Q3FeaturesController extends Controller
{
    public function __construct(
        private ESignatureService $esig,
        private EuMobilityComplianceService $compliance,
        private CarbonFootprintCalculatorService $carbon,
    ) {}

    // ═══════════════════════════════════════════════════════════
    // E-SIGNATURE ENDPOINTS
    // ═══════════════════════════════════════════════════════════

    /**
     * Create signing request for a transport contract.
     */
    public function createContractSignature(Request $request, TransportOrder $order): JsonResponse
    {
        $request->validate([
            'shipper_email' => 'nullable|email',
            'carrier_email' => 'nullable|email',
            'provider' => 'nullable|in:docusign,adobe_sign,internal',
        ]);

        $result = $this->esig->createContractEnvelope($order, $request->only([
            'shipper_email', 'carrier_email', 'provider',
        ]));

        return response()->json(['data' => $result], isset($result['error']) ? 422 : 201);
    }

    /**
     * Create signing request for a CMR document.
     */
    public function signCmr(Request $request, EcmrDocument $ecmr): JsonResponse
    {
        $request->validate([
            'signers' => 'required|array|min:1',
            'signers.*.name' => 'required|string',
            'signers.*.email' => 'required|email',
            'signers.*.role' => 'nullable|string',
        ]);

        $result = $this->esig->signCmr($ecmr, $request->input('signers'));

        return response()->json(['data' => $result], isset($result['error']) ? 422 : 201);
    }

    /**
     * Get signature status.
     */
    public function signatureStatus(Request $request, string $envelopeId): JsonResponse
    {
        $provider = $request->query('provider');
        $result = $this->esig->getStatus($envelopeId, $provider);

        return response()->json(['data' => $result]);
    }

    /**
     * Verify a signature.
     */
    public function verifySignature(Request $request, string $signatureId): JsonResponse
    {
        $provider = $request->query('provider');
        $result = $this->esig->verifySignature($signatureId, $provider);

        return response()->json(['data' => $result]);
    }

    /**
     * Sign document (internal provider).
     */
    public function signInternal(Request $request, string $signatureId): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'signature_data' => 'nullable|array',
        ]);

        $result = $this->esig->signInternal(
            $signatureId,
            $request->input('token'),
            $request->input('signature_data', [])
        );

        return response()->json(['data' => $result], $result['signed'] ? 200 : 422);
    }

    /**
     * Download signed document.
     */
    public function downloadSigned(Request $request, string $envelopeId): JsonResponse
    {
        $provider = $request->query('provider');
        $content = $this->esig->downloadSigned($envelopeId, $provider);

        if (!$content) {
            return response()->json(['message' => 'Document not found or not yet signed.'], 404);
        }

        return response()->json([
            'data' => [
                'content_base64' => base64_encode($content),
                'filename' => "signed-{$envelopeId}.pdf",
            ],
        ]);
    }

    /**
     * List signature requests for current company.
     */
    public function listSignatures(Request $request): JsonResponse
    {
        $result = $this->esig->listRequests(
            $request->user()->company_id,
            $request->only(['status', 'document_type', 'limit'])
        );

        return response()->json(['data' => $result]);
    }

    /**
     * DocuSign webhook callback.
     */
    public function docusignWebhook(Request $request): JsonResponse
    {
        $result = $this->esig->handleDocusignWebhook($request->all());
        return response()->json($result);
    }

    // ═══════════════════════════════════════════════════════════
    // EU MOBILITY COMPLIANCE ENDPOINTS
    // ═══════════════════════════════════════════════════════════

    /**
     * Run full compliance check for a driver.
     */
    public function driverComplianceCheck(Request $request, int $driverId): JsonResponse
    {
        $request->validate([
            'driving_log' => 'nullable|array',
            'driving_log.*.start' => 'required_with:driving_log|date',
            'driving_log.*.end' => 'required_with:driving_log|date',
            'driving_log.*.type' => 'required_with:driving_log|in:driving,rest,break,other',
        ]);

        $log = $request->input('driving_log', []);
        $result = $this->compliance->runFullCheck($driverId, $log);

        return response()->json(['data' => $result]);
    }

    /**
     * Check cabotage compliance.
     */
    public function cabotageCheck(Request $request): JsonResponse
    {
        $request->validate([
            'vehicle_id' => 'required|integer',
            'host_country' => 'required|string|size:2',
            'deliveries' => 'required|array',
            'deliveries.*.completed_at' => 'required|date',
            'deliveries.*.type' => 'required|in:international,cabotage',
            'deliveries.*.country' => 'required|string|size:2',
        ]);

        $result = $this->compliance->checkCabotage(
            $request->input('vehicle_id'),
            strtoupper($request->input('host_country')),
            $request->input('deliveries')
        );

        return response()->json(['data' => $result]);
    }

    /**
     * Check Posted Workers Directive compliance.
     */
    public function postedWorkersCheck(Request $request): JsonResponse
    {
        $request->validate([
            'driver_id' => 'required|integer',
            'host_country' => 'required|string|size:2',
            'assignment' => 'required|array',
            'assignment.type' => 'nullable|string',
            'assignment.hourly_wage' => 'nullable|numeric',
            'assignment.posting_declaration_id' => 'nullable|string',
            'assignment.documents' => 'nullable|array',
        ]);

        $result = $this->compliance->checkPostedWorkers(
            $request->input('driver_id'),
            strtoupper($request->input('host_country')),
            $request->input('assignment')
        );

        return response()->json(['data' => $result]);
    }

    /**
     * Validate tachograph data.
     */
    public function validateTachograph(Request $request): JsonResponse
    {
        $request->validate([
            'tachograph_data' => 'required|array',
            'tachograph_data.vehicle_registration_date' => 'nullable|date',
            'tachograph_data.tachograph_type' => 'nullable|string',
            'tachograph_data.last_calibration' => 'nullable|date',
        ]);

        $result = $this->compliance->validateTachograph($request->input('tachograph_data'));

        return response()->json(['data' => $result]);
    }

    /**
     * Fleet-wide compliance report.
     */
    public function fleetComplianceReport(Request $request): JsonResponse
    {
        $result = $this->compliance->generateFleetComplianceReport(
            $request->user()->company_id
        );

        return response()->json(['data' => $result]);
    }

    /**
     * Get EU minimum wages.
     */
    public function minimumWages(Request $request): JsonResponse
    {
        $country = $request->query('country');

        if ($country) {
            $wage = $this->compliance->getMinimumWage(strtoupper($country));
            return response()->json(['data' => ['country' => strtoupper($country), 'minimum_wage_eur' => $wage]]);
        }

        return response()->json(['data' => $this->compliance->getAllMinimumWages()]);
    }

    // ═══════════════════════════════════════════════════════════
    // ENHANCED CARBON CALCULATOR ENDPOINTS
    // ═══════════════════════════════════════════════════════════

    /**
     * GLEC v3 / ISO 14083 calculation.
     */
    public function calculateGlec(Request $request): JsonResponse
    {
        $request->validate([
            'distance_km' => 'required|numeric|min:1',
            'weight_kg' => 'nullable|numeric|min:0',
            'vehicle_type' => 'nullable|string',
            'fuel_type' => 'nullable|string',
            'mode' => 'nullable|string|in:road,rail,sea_container,sea_bulk,inland_waterway,air_cargo,air_express',
            'load_factor_pct' => 'nullable|numeric|between:0,100',
            'empty_return' => 'nullable|boolean',
        ]);

        $result = $this->carbon->calculateGlec($request->all());

        return response()->json(['data' => $result]);
    }

    /**
     * Multimodal comparison.
     */
    public function compareMultimodal(Request $request): JsonResponse
    {
        $request->validate([
            'distance_km' => 'required|numeric|min:1',
            'weight_kg' => 'nullable|numeric|min:0',
            'load_factor_pct' => 'nullable|numeric|between:0,100',
        ]);

        $result = $this->carbon->compareMultimodal($request->all());

        return response()->json(['data' => $result]);
    }

    /**
     * Calculate multimodal route emissions (multiple legs).
     */
    public function multimodalRoute(Request $request): JsonResponse
    {
        $request->validate([
            'legs' => 'required|array|min:1',
            'legs.*.mode' => 'required|string',
            'legs.*.distance_km' => 'required|numeric|min:0.1',
            'legs.*.weight_kg' => 'nullable|numeric|min:0',
            'legs.*.fuel_type' => 'nullable|string',
            'legs.*.vehicle_type' => 'nullable|string',
        ]);

        $result = $this->carbon->calculateMultimodalRoute($request->input('legs'));

        return response()->json(['data' => $result]);
    }

    /**
     * Fleet carbon benchmark.
     */
    public function fleetCarbonBenchmark(Request $request): JsonResponse
    {
        $months = $request->input('months', 12);
        $result = $this->carbon->fleetBenchmark($request->user()->company_id, $months);

        return response()->json(['data' => $result]);
    }

    /**
     * Carbon reduction recommendations.
     */
    public function carbonRecommendations(Request $request): JsonResponse
    {
        $result = $this->carbon->generateRecommendations($request->user()->company_id);

        return response()->json(['data' => $result]);
    }
}
