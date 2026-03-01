<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\TransportOrder;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

/**
 * Unified document generation service — invoices, CMR consignment notes, waybills.
 */
class DocumentGenerationService
{
    /**
     * Generate a professional invoice PDF.
     */
    public function generateInvoicePdf(Invoice $invoice): \Barryvdh\DomPDF\PDF
    {
        $invoice->load(['customerCompany', 'transportOrder']);

        $data = [
            'invoice'     => $invoice,
            'company'     => $invoice->company ?? null,
            'lineItems'   => $invoice->line_items ?? [],
            'generatedAt' => now()->format('d.m.Y H:i'),
        ];

        return Pdf::loadView('documents.invoice', $data)
            ->setPaper('a4', 'portrait');
    }

    /**
     * Generate a CMR consignment note PDF (Convention relative au contrat de transport
     * international de Marchandises par Route).
     */
    public function generateCmrPdf(TransportOrder $order): \Barryvdh\DomPDF\PDF
    {
        $order->load(['shipper', 'carrier', 'freightOffer', 'vehicleOffer']);

        $data = [
            'order'       => $order,
            'shipper'     => $order->shipper,
            'carrier'     => $order->carrier,
            'freight'     => $order->freightOffer,
            'vehicle'     => $order->vehicleOffer,
            'cmrNumber'   => 'CMR-' . strtoupper(substr(md5($order->id . $order->created_at), 0, 8)),
            'generatedAt' => now()->format('d.m.Y H:i'),
        ];

        return Pdf::loadView('documents.cmr', $data)
            ->setPaper('a4', 'portrait');
    }

    /**
     * Generate a waybill PDF.
     */
    public function generateWaybillPdf(TransportOrder $order): \Barryvdh\DomPDF\PDF
    {
        $order->load(['shipper', 'carrier', 'freightOffer']);

        $data = [
            'order'         => $order,
            'shipper'       => $order->shipper,
            'carrier'       => $order->carrier,
            'freight'       => $order->freightOffer,
            'waybillNumber' => 'WB-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
            'generatedAt'   => now()->format('d.m.Y H:i'),
        ];

        return Pdf::loadView('documents.waybill', $data)
            ->setPaper('a4', 'portrait');
    }

    /**
     * Generate a delivery note PDF.
     */
    public function generateDeliveryNotePdf(TransportOrder $order): \Barryvdh\DomPDF\PDF
    {
        $order->load(['shipper', 'carrier', 'freightOffer']);

        $data = [
            'order'       => $order,
            'shipper'     => $order->shipper,
            'carrier'     => $order->carrier,
            'freight'     => $order->freightOffer,
            'noteNumber'  => 'DN-' . str_pad($order->id, 8, '0', STR_PAD_LEFT),
            'generatedAt' => now()->format('d.m.Y H:i'),
        ];

        return Pdf::loadView('documents.delivery-note', $data)
            ->setPaper('a4', 'portrait');
    }
}
