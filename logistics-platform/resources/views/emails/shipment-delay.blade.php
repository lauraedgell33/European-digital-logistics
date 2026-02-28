<x-mail::message>
# ⚠️ Shipment Delay Alert

Dear {{ $user->name }},

We regret to inform you that your shipment has been delayed.

<x-mail::panel>
**Order:** {{ $order->order_number }}<br>
**Expected Delivery:** {{ $originalEta->format('d/m/Y H:i') }}<br>
**New Estimated Delivery:** {{ $newEta->format('d/m/Y H:i') }}<br>
**Delay:** {{ $originalEta->diffInHours($newEta) }} hours
</x-mail::panel>

<x-mail::table>
| Detail | Value |
|:-------|------:|
| Origin | {{ $order->origin_city }}, {{ $order->origin_country }} |
| Destination | {{ $order->destination_city }}, {{ $order->destination_country }} |
| Current Location | {{ $currentLocation ?? 'Updating...' }} |
</x-mail::table>

@if($reason)
**Reason for delay:** {{ $reason }}
@endif

We are doing everything possible to minimize the impact and will keep you updated.

<x-mail::button :url="$trackingUrl" color="primary">
Track Shipment
</x-mail::button>

Regards,<br>
{{ config('app.name') }}

<x-mail::subcopy>
You received this notification because you are subscribed to shipment updates. Manage your notification preferences in your account settings.
</x-mail::subcopy>
</x-mail::message>
