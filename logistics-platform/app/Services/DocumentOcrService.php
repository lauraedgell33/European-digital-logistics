<?php

namespace App\Services;

use App\Models\DocumentScan;
use Illuminate\Http\UploadedFile;

class DocumentOcrService
{
    /**
     * Process an uploaded document with OCR.
     */
    public function processDocument(
        UploadedFile $file,
        string $documentType,
        int $companyId,
        int $userId,
        ?int $orderId = null
    ): DocumentScan {
        $filename = $file->getClientOriginalName();
        $path = $file->store("documents/{$companyId}", 'public');

        $scan = DocumentScan::create([
            'company_id' => $companyId,
            'user_id' => $userId,
            'transport_order_id' => $orderId,
            'document_type' => $documentType,
            'original_filename' => $filename,
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size_bytes' => $file->getSize(),
            'status' => 'processing',
        ]);

        // Simulate OCR processing (in production: Tesseract, Google Vision, Azure Form Recognizer)
        $extractedData = $this->simulateOcr($documentType, $filename);

        $scan->update([
            'extracted_data' => $extractedData['data'],
            'raw_ocr_text' => $extractedData['raw_text'],
            'confidence_score' => $extractedData['confidence'],
            'validation_errors' => $extractedData['errors'],
            'is_validated' => empty($extractedData['errors']),
            'status' => empty($extractedData['errors']) ? 'completed' : 'completed',
        ]);

        return $scan->fresh();
    }

    /**
     * Validate extracted data against business rules.
     */
    public function validateExtraction(DocumentScan $scan): array
    {
        $data = $scan->extracted_data ?? [];
        $errors = [];

        switch ($scan->document_type) {
            case 'cmr':
                if (empty($data['sender_name'])) $errors[] = 'Missing sender name';
                if (empty($data['carrier_name'])) $errors[] = 'Missing carrier name';
                if (empty($data['consignee_name'])) $errors[] = 'Missing consignee name';
                if (empty($data['goods_description'])) $errors[] = 'Missing goods description';
                break;
            case 'invoice':
                if (empty($data['invoice_number'])) $errors[] = 'Missing invoice number';
                if (empty($data['total_amount'])) $errors[] = 'Missing total amount';
                if (empty($data['issue_date'])) $errors[] = 'Missing issue date';
                break;
            case 'pod':
                if (empty($data['delivery_date'])) $errors[] = 'Missing delivery date';
                if (empty($data['receiver_signature'])) $errors[] = 'Missing receiver signature';
                break;
        }

        $scan->update([
            'validation_errors' => $errors,
            'is_validated' => empty($errors),
            'status' => empty($errors) ? 'validated' : 'completed',
        ]);

        return [
            'is_valid' => empty($errors),
            'errors' => $errors,
            'data' => $data,
        ];
    }

    /**
     * Get document processing stats for a company.
     */
    public function getStats(int $companyId): array
    {
        $total = DocumentScan::where('company_id', $companyId)->count();
        $completed = DocumentScan::where('company_id', $companyId)->where('status', 'completed')->count();
        $validated = DocumentScan::where('company_id', $companyId)->where('is_validated', true)->count();
        $avgConfidence = DocumentScan::where('company_id', $companyId)
            ->whereNotNull('confidence_score')
            ->avg('confidence_score');

        $byType = DocumentScan::where('company_id', $companyId)
            ->selectRaw('document_type, COUNT(*) as count')
            ->groupBy('document_type')
            ->pluck('count', 'document_type');

        return [
            'total_scans' => $total,
            'completed' => $completed,
            'validated' => $validated,
            'avg_confidence' => round($avgConfidence ?? 0, 1),
            'by_type' => $byType,
        ];
    }

    /**
     * Simulated OCR extraction (production: integrate real OCR API).
     */
    private function simulateOcr(string $type, string $filename): array
    {
        $confidence = rand(75, 98) / 1;

        $templates = [
            'cmr' => [
                'data' => [
                    'document_number' => 'CMR-' . rand(100000, 999999),
                    'sender_name' => 'Sender Company GmbH',
                    'sender_address' => 'Industriestr. 42, 80939 München, Germany',
                    'carrier_name' => 'Transport Solutions SRL',
                    'carrier_address' => 'Str. Transportului 15, București, Romania',
                    'consignee_name' => 'Destination Logistics SA',
                    'consignee_address' => 'Rue du Commerce 78, Paris, France',
                    'goods_description' => 'Industrial equipment, 25 pallets',
                    'gross_weight_kg' => 12500,
                    'number_of_packages' => 25,
                    'place_of_loading' => 'München, Germany',
                    'place_of_delivery' => 'Paris, France',
                ],
                'raw_text' => ["Extracted from: {$filename}", "CMR Consignment Note", "International Road Transport"],
            ],
            'invoice' => [
                'data' => [
                    'invoice_number' => 'INV-2026-' . rand(1000, 9999),
                    'issue_date' => now()->subDays(rand(1, 30))->toDateString(),
                    'due_date' => now()->addDays(rand(14, 60))->toDateString(),
                    'total_amount' => rand(500, 15000),
                    'currency' => 'EUR',
                    'vat_rate' => 19,
                    'vat_amount' => 0,
                    'seller_name' => 'Transport Provider SRL',
                    'buyer_name' => 'Client Company GmbH',
                ],
                'raw_text' => ["Extracted from: {$filename}", "Invoice/Factura"],
            ],
            'pod' => [
                'data' => [
                    'delivery_date' => now()->subDays(rand(1, 5))->toDateString(),
                    'delivery_time' => rand(6, 18) . ':' . str_pad(rand(0, 59), 2, '0', STR_PAD_LEFT),
                    'receiver_name' => 'John Smith',
                    'receiver_signature' => true,
                    'condition' => 'good',
                    'damages_noted' => false,
                ],
                'raw_text' => ["Extracted from: {$filename}", "Proof of Delivery"],
            ],
        ];

        $template = $templates[$type] ?? $templates['invoice'];
        $template['confidence'] = $confidence;
        $template['errors'] = $confidence < 80 ? ['Low confidence — manual review recommended'] : [];

        return $template;
    }
}
