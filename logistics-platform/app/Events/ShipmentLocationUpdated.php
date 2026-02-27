<?php

namespace App\Events;

use App\Models\Shipment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ShipmentLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Shipment $shipment
    ) {}

    public function broadcastOn(): array
    {
        $order = $this->shipment->transportOrder;

        return [
            new PrivateChannel("shipment.{$this->shipment->id}"),
            new PrivateChannel("company.{$order->shipper_id}.tracking"),
            new PrivateChannel("company.{$order->carrier_id}.tracking"),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'shipment_id' => $this->shipment->id,
            'tracking_code' => $this->shipment->tracking_code,
            'lat' => $this->shipment->current_lat,
            'lng' => $this->shipment->current_lng,
            'speed_kmh' => $this->shipment->speed_kmh,
            'heading' => $this->shipment->heading,
            'temperature' => $this->shipment->temperature,
            'eta' => $this->shipment->eta?->toIso8601String(),
            'status' => $this->shipment->status,
            'location_name' => $this->shipment->current_location_name,
            'last_update' => $this->shipment->last_update?->toIso8601String(),
        ];
    }
}
