<x-mail::message>
# Order Status Update

Dear {{ $user->name }},

Your transport order **{{ $order->order_number }}** has been updated.

<x-mail::panel>
**New Status:** {{ ucfirst(str_replace('_', ' ', $order->status)) }}
</x-mail::panel>

<x-mail::table>
| Detail | Value |
|:-------|------:|
| Order Number | {{ $order->order_number }} |
| Origin | {{ $order->origin_city }}, {{ $order->origin_country }} |
| Destination | {{ $order->destination_city }}, {{ $order->destination_country }} |
| Updated At | {{ now()->format('d/m/Y H:i') }} |
</x-mail::table>

@if($order->status === 'accepted')
Your order has been accepted by the carrier. Transport will begin according to the agreed schedule.
@elseif($order->status === 'in_transit')
Your shipment is now in transit. You can track it in real-time using the link below.
@elseif($order->status === 'delivered')
Your shipment has been delivered successfully. Thank you for using LogiMarket!
@elseif($order->status === 'cancelled')
This order has been cancelled. If you have questions, please contact support.
@endif

<x-mail::button :url="$url" color="primary">
View Order Details
</x-mail::button>

Regards,<br>
{{ config('app.name') }}
</x-mail::message>
