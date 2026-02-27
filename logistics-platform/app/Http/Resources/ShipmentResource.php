<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShipmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transport_order_id' => $this->transport_order_id,
            'tracking_code' => $this->tracking_code,
            'status' => $this->status,
            'current_lat' => $this->current_lat,
            'current_lng' => $this->current_lng,
            'current_location_name' => $this->current_location_name,
            'remaining_distance_km' => $this->remaining_distance_km,
            'tracking_device_id' => $this->tracking_device_id,
            'last_update' => $this->last_update?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'transport_order' => new TransportOrderResource($this->whenLoaded('transportOrder')),
            'events' => ShipmentEventResource::collection($this->whenLoaded('events')),
            'positions' => TrackingPositionResource::collection($this->whenLoaded('positions')),
        ];
    }
}
