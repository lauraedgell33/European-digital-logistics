<x-mail::message>
# Payment Reminder

Dear {{ $debtor->debtor_name ?? 'Customer' }},

This is a {{ $reminderLevel }} reminder regarding your outstanding invoice.

<x-mail::panel>
**Invoice:** {{ $debtor->invoice_number }}<br>
**Original Amount:** {{ number_format($debtor->original_amount, 2) }} {{ $debtor->currency }}<br>
**Outstanding:** {{ number_format($debtor->outstanding_amount, 2) }} {{ $debtor->currency }}<br>
**Due Date:** {{ $debtor->due_date->format('d/m/Y') }}<br>
**Days Overdue:** {{ $debtor->due_date->diffInDays(now()) }}
</x-mail::panel>

@if($reminderLevel === 'first')
We kindly request that you settle this invoice at your earliest convenience.
@elseif($reminderLevel === 'second')
This is our second reminder. Please settle this outstanding amount within 14 days to avoid additional collection fees.
@else
**This is our final reminder before initiating formal collection proceedings.** Please settle the outstanding amount within 7 days. Additional collection fees of up to {{ number_format($debtor->collection_fee ?? 0, 2) }} {{ $debtor->currency }} may apply.
@endif

<x-mail::button :url="$paymentUrl" color="primary">
Pay Now
</x-mail::button>

If you have already made this payment, please disregard this reminder and forward us the proof of payment.

Regards,<br>
{{ $debtor->creditor->name ?? config('app.name') }}

<x-mail::subcopy>
Reference: {{ $debtor->invoice_number }} | Creditor: {{ $debtor->creditor->name ?? 'N/A' }}
</x-mail::subcopy>
</x-mail::message>
