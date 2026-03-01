<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\TransportOrder;
use App\Services\DocumentGenerationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentGenerationService $docService
    ) {}

    /**
     * Download invoice as PDF.
     */
    public function invoicePdf(Request $request, Invoice $invoice)
    {
        // Authorization: only company owner or admin
        if ($invoice->company_id !== $request->user()->company_id && !$request->user()->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $pdf = $this->docService->generateInvoicePdf($invoice);
        return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
    }

    /**
     * Download CMR consignment note as PDF.
     */
    public function cmrPdf(Request $request, TransportOrder $order)
    {
        $this->authorizeOrder($request, $order);
        $pdf = $this->docService->generateCmrPdf($order);
        return $pdf->download("cmr-{$order->order_number}.pdf");
    }

    /**
     * Download waybill as PDF.
     */
    public function waybillPdf(Request $request, TransportOrder $order)
    {
        $this->authorizeOrder($request, $order);
        $pdf = $this->docService->generateWaybillPdf($order);
        return $pdf->download("waybill-{$order->order_number}.pdf");
    }

    /**
     * Download delivery note as PDF.
     */
    public function deliveryNotePdf(Request $request, TransportOrder $order)
    {
        $this->authorizeOrder($request, $order);
        $pdf = $this->docService->generateDeliveryNotePdf($order);
        return $pdf->download("delivery-note-{$order->order_number}.pdf");
    }

    /**
     * List available document types for an order.
     */
    public function availableDocuments(Request $request, TransportOrder $order): JsonResponse
    {
        $this->authorizeOrder($request, $order);

        $docs = [
            ['type' => 'cmr', 'name' => 'CMR Consignment Note', 'url' => "/api/v1/documents/orders/{$order->id}/cmr"],
            ['type' => 'waybill', 'name' => 'Waybill', 'url' => "/api/v1/documents/orders/{$order->id}/waybill"],
            ['type' => 'delivery_note', 'name' => 'Delivery Note', 'url' => "/api/v1/documents/orders/{$order->id}/delivery-note"],
        ];

        return response()->json(['data' => $docs]);
    }

    private function authorizeOrder(Request $request, TransportOrder $order): void
    {
        if ($order->shipper_id !== $request->user()->company_id
            && $order->carrier_id !== $request->user()->company_id
            && !$request->user()->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }
    }
}
