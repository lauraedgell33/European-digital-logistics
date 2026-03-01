<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DocumentOcrService;
use App\Models\DocumentScan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DocumentOcrController extends Controller
{
    public function __construct(
        private readonly DocumentOcrService $ocrService
    ) {}

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,tiff',
            'document_type' => 'required|in:cmr,invoice,packing_list,customs,pod,bol',
            'transport_order_id' => 'nullable|exists:transport_orders,id',
        ]);

        $scan = $this->ocrService->processDocument(
            $request->file('file'),
            $request->input('document_type'),
            $request->user()->company_id,
            $request->user()->id,
            $request->input('transport_order_id')
        );

        return response()->json([
            'message' => 'Document processed.',
            'data' => $scan,
        ], 201);
    }

    public function validateExtraction(Request $request, DocumentScan $scan): JsonResponse
    {
        $result = $this->ocrService->validateExtraction($scan);
        return response()->json(['data' => $result]);
    }

    public function index(Request $request): JsonResponse
    {
        $scans = DocumentScan::where('company_id', $request->user()->company_id)
            ->with(['transportOrder:id,order_number', 'user:id,name'])
            ->when($request->input('type'), fn($q, $type) => $q->where('document_type', $type))
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($scans);
    }

    public function show(DocumentScan $scan): JsonResponse
    {
        return response()->json(['data' => $scan]);
    }

    public function stats(Request $request): JsonResponse
    {
        $stats = $this->ocrService->getStats($request->user()->company_id);
        return response()->json(['data' => $stats]);
    }
}
