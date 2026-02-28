<x-mail::message>
# Invoice {{ $invoice->invoice_number }}

Dear {{ $invoice->customer_name ?? $invoice->customerCompany->name ?? 'Customer' }},

Please find below your invoice details:

<x-mail::table>
| Detail | Value |
|:-------|------:|
| Invoice Number | {{ $invoice->invoice_number }} |
| Issue Date | {{ $invoice->issue_date->format('d/m/Y') }} |
| Due Date | {{ $invoice->due_date->format('d/m/Y') }} |
| Subtotal | {{ number_format($invoice->subtotal, 2) }} {{ $invoice->currency }} |
| Tax ({{ $invoice->tax_rate }}%) | {{ number_format($invoice->tax_amount, 2) }} {{ $invoice->currency }} |
| **Total Amount** | **{{ number_format($invoice->total_amount, 2) }} {{ $invoice->currency }}** |
</x-mail::table>

@if($invoice->payment_terms)
**Payment Terms:** {{ $invoice->payment_terms }}
@endif

@if($invoice->bank_iban)
**Bank Details:**
- IBAN: {{ $invoice->bank_iban }}
- BIC: {{ $invoice->bank_bic }}
@endif

<x-mail::button :url="$url" color="primary">
View Invoice
</x-mail::button>

@if($invoice->notes)
**Notes:** {{ $invoice->notes }}
@endif

Thank you for your business!

Regards,<br>
{{ config('app.name') }}

<x-mail::subcopy>
If you have questions about this invoice, please contact us at {{ config('mail.from.address') }}.
</x-mail::subcopy>
</x-mail::message>
