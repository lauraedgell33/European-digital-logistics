<?php

namespace App\Observers;

use App\Models\Invoice;
use Carbon\Carbon;

class InvoiceObserver
{
    public function creating(Invoice $invoice): void
    {
        // Auto-generate invoice number if empty
        if (empty($invoice->invoice_number)) {
            $prefix = 'INV-' . date('Y') . '-';
            $lastNumber = Invoice::withTrashed()
                ->where('invoice_number', 'like', $prefix . '%')
                ->orderByRaw("CAST(SUBSTRING(invoice_number, " . (strlen($prefix) + 1) . ") AS UNSIGNED) DESC")
                ->value('invoice_number');
            
            $sequence = $lastNumber ? (int) substr($lastNumber, strlen($prefix)) + 1 : 1;
            $invoice->invoice_number = $prefix . str_pad($sequence, 5, '0', STR_PAD_LEFT);
        }

        // Auto-calculate totals
        if ($invoice->subtotal && $invoice->tax_rate && !$invoice->total_amount) {
            $invoice->tax_amount = round($invoice->subtotal * $invoice->tax_rate / 100, 2);
            $invoice->total_amount = $invoice->subtotal + $invoice->tax_amount;
        }
    }

    public function updated(Invoice $invoice): void
    {
        // Auto-mark as paid when paid_amount >= total_amount
        if ($invoice->isDirty('paid_amount') && !$invoice->isDirty('status')) {
            $statusValue = is_string($invoice->status) ? $invoice->status : $invoice->status->value;
            if ($invoice->paid_amount >= $invoice->total_amount && $statusValue !== 'paid') {
                $invoice->withoutEvents(function () use ($invoice) {
                    $invoice->update(['status' => 'paid', 'paid_at' => now()]);
                });
            }
        }
    }
}
