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
            $invoice->invoice_number = Invoice::generateNumber();
        }

        // Auto-calculate totals
        if ($invoice->subtotal !== null && $invoice->tax_rate !== null && !$invoice->total_amount) {
            $invoice->tax_amount = round($invoice->subtotal * $invoice->tax_rate / 100, 2);
            $invoice->total_amount = $invoice->subtotal + $invoice->tax_amount;
        }
    }

    public function updated(Invoice $invoice): void
    {
        // Auto-mark as paid when paid_amount >= total_amount
        if ($invoice->isDirty('paid_amount') && !$invoice->isDirty('status')) {
            if ($invoice->paid_amount >= $invoice->total_amount && $invoice->status !== \App\Enums\InvoiceStatus::Paid) {
                $invoice->status = 'paid';
                $invoice->paid_at = now();
                $invoice->saveQuietly();
            }
        }
    }
}
