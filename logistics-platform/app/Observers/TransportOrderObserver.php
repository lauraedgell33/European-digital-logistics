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
            $oldStatus = $order->getOriginal('status');
            $newStatus = $order->status;

            // Auto-create shipment event when status changes
            if ($order->shipment && in_array(is_string($newStatus) ? $newStatus : $newStatus->value, ['picked_up', 'in_transit', 'delivered', 'completed'])) {
                $statusValue = is_string($newStatus) ? $newStatus : $newStatus->value;
                $order->shipment->events()->create([
                    'event_type' => $statusValue,
                    'description' => "Order status changed to {$statusValue}",
                    'occurred_at' => now(),
                ]);
            }
        }
    }
}
