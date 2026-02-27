<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ShipmentPositionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $shipmentId,
        public array $position,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('tracking.' . $this->shipmentId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'shipment_id' => $this->shipmentId,
            'position' => $this->position,
        ];
    }

    public function broadcastAs(): string
    {
        return 'shipment.position.updated';
    }
}
