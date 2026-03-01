<?php

namespace App\Observers;

use App\Models\TransportOrder;
use App\Models\ShipmentEvent;
use Filament\Notifications\Notification;

class TransportOrderObserver
{
    public function updated(TransportOrder $order): void
    {
        if ($order->isDirty('status')) {
            $newStatus = $order->status;
            $statusValue = $newStatus instanceof \App\Enums\TransportOrderStatus ? $newStatus->value : (string)$newStatus;

            // Auto-create shipment event when status changes
            if ($order->shipment && in_array($statusValue, ['picked_up', 'in_transit', 'delivered', 'completed'])) {
                $order->shipment->events()->create([
                    'event_type' => $statusValue,
                    'description' => "Order status changed to {$statusValue}",
                    'occurred_at' => now(),
                ]);
            }
        }
    }
}
