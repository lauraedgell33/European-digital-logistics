<x-mail::message>
# 🏆 Tender Awarded

Dear {{ $user->name }},

Congratulations! Your bid on tender **{{ $tender->title }}** has been awarded.

<x-mail::panel>
**Tender:** {{ $tender->title }}<br>
**Reference:** {{ $tender->reference_number }}<br>
**Your Bid:** {{ number_format($bid->amount, 2) }} {{ $bid->currency ?? 'EUR' }}
</x-mail::panel>

<x-mail::table>
| Detail | Value |
|:-------|------:|
| Route | {{ $tender->origin_city }} → {{ $tender->destination_city }} |
| Start Date | {{ $tender->start_date?->format('d/m/Y') ?? 'TBD' }} |
| End Date | {{ $tender->end_date?->format('d/m/Y') ?? 'TBD' }} |
| Total Bids | {{ $tender->bids_count ?? 'N/A' }} |
</x-mail::table>

Please review and confirm the transport order within the next 48 hours.

<x-mail::button :url="$url" color="success">
View Tender Details
</x-mail::button>

Regards,<br>
{{ config('app.name') }}
</x-mail::message>
