<x-mail::message>
# eCMR Document Ready

Dear {{ $user->name }},

Your electronic consignment note (eCMR) is ready for review and signature.

<x-mail::panel>
**eCMR Number:** {{ $ecmr->ecmr_number }}<br>
**Order:** {{ $ecmr->transportOrder->order_number ?? 'N/A' }}<br>
**Status:** {{ ucfirst(str_replace('_', ' ', $ecmr->status)) }}
</x-mail::panel>

<x-mail::table>
| Party | Company | Country |
|:------|:--------|:--------|
| Sender | {{ $ecmr->sender_name }} | {{ $ecmr->sender_country }} |
| Carrier | {{ $ecmr->carrier_name }} | {{ $ecmr->carrier_country }} |
| Consignee | {{ $ecmr->consignee_name }} | {{ $ecmr->consignee_country }} |
</x-mail::table>

<x-mail::table>
| Detail | Value |
|:-------|------:|
| Pickup | {{ $ecmr->place_of_taking_over }} ({{ $ecmr->date_of_taking_over?->format('d/m/Y') }}) |
| Delivery | {{ $ecmr->place_of_delivery }} ({{ $ecmr->date_of_delivery?->format('d/m/Y') }}) |
| Weight | {{ number_format($ecmr->gross_weight_kg, 0) }} kg |
| Packages | {{ $ecmr->number_of_packages }} |
</x-mail::table>

@if($ecmr->is_hazardous)
⚠️ **This shipment contains hazardous goods (ADR Class: {{ $ecmr->adr_class }})**
@endif

<x-mail::button :url="$url" color="primary">
View & Sign eCMR
</x-mail::button>

@if($ecmr->blockchain_tx_hash)
This document has been registered on the blockchain for tamper-proof verification.
@endif

Regards,<br>
{{ config('app.name') }}
</x-mail::message>
