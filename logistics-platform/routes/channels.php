<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Register all of the broadcast channels that the application supports.
|
*/

// Private channel for user-specific notifications
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private channel for company-level events
Broadcast::channel('company.{companyId}', function ($user, $companyId) {
    return (int) $user->company_id === (int) $companyId;
});

// Private channel for conversation messages
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = \App\Models\Conversation::find($conversationId);
    if (!$conversation) return false;

    return $conversation->participants()->where('user_id', $user->id)->exists()
        || $conversation->company_a_id === $user->company_id
        || $conversation->company_b_id === $user->company_id;
});

// Private channel for order status updates
Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    $order = \App\Models\TransportOrder::find($orderId);
    if (!$order) return false;

    return $order->shipper_id === $user->company_id
        || $order->carrier_id === $user->company_id
        || $order->created_by === $user->id;
});

// Public channel for tracking (accessible via tracking code)
Broadcast::channel('tracking.{shipmentId}', function ($user, $shipmentId) {
    $shipment = \App\Models\Shipment::find($shipmentId);
    if (!$shipment) return false;

    $order = $shipment->transportOrder;
    if (!$order) return true; // Public shipment

    return $order->shipper_id === $user->company_id
        || $order->carrier_id === $user->company_id;
});
