<?php

namespace App\Events;

use App\Models\TransportOrder;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TransportOrder $order,
        public string $previousStatus,
        public string $newStatus,
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('order.' . $this->order->id),
        ];

        if ($this->order->shipper_id) {
            $channels[] = new PrivateChannel('company.' . $this->order->shipper_id);
        }
        if ($this->order->carrier_id) {
            $channels[] = new PrivateChannel('company.' . $this->order->carrier_id);
        }

        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'previous_status' => $this->previousStatus,
            'new_status' => $this->newStatus,
            'updated_at' => $this->order->updated_at?->toISOString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.status.changed';
    }
}
