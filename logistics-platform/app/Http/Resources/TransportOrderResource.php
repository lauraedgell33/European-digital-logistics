<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransportOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'pickup_country' => $this->pickup_country,
            'pickup_city' => $this->pickup_city,
            'pickup_address' => $this->pickup_address,
            'pickup_postal_code' => $this->pickup_postal_code,
            'pickup_contact_name' => $this->pickup_contact_name,
            'pickup_contact_phone' => $this->pickup_contact_phone,
            'pickup_date' => $this->pickup_date?->toDateString(),
            'pickup_time_from' => $this->pickup_time_from,
            'pickup_time_to' => $this->pickup_time_to,
            'delivery_country' => $this->delivery_country,
            'delivery_city' => $this->delivery_city,
            'delivery_address' => $this->delivery_address,
            'delivery_postal_code' => $this->delivery_postal_code,
            'delivery_contact_name' => $this->delivery_contact_name,
            'delivery_contact_phone' => $this->delivery_contact_phone,
            'delivery_date' => $this->delivery_date?->toDateString(),
            'delivery_time_from' => $this->delivery_time_from,
            'delivery_time_to' => $this->delivery_time_to,
            'cargo_type' => $this->cargo_type,
            'cargo_description' => $this->cargo_description,
            'weight' => $this->weight,
            'volume' => $this->volume,
            'pallet_count' => $this->pallet_count,
            'total_price' => $this->total_price,
            'currency' => $this->currency,
            'payment_terms' => $this->payment_terms,
            'special_instructions' => $this->special_instructions,
            'accepted_at' => $this->accepted_at?->toIso8601String(),
            'picked_up_at' => $this->picked_up_at?->toIso8601String(),
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'cancellation_reason' => $this->cancellation_reason,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'shipper' => new CompanyResource($this->whenLoaded('shipper')),
            'carrier' => new CompanyResource($this->whenLoaded('carrier')),
            'created_by' => new UserResource($this->whenLoaded('createdBy')),
            'freight_offer' => new FreightOfferResource($this->whenLoaded('freightOffer')),
            'vehicle_offer' => new VehicleOfferResource($this->whenLoaded('vehicleOffer')),
            'shipment' => new ShipmentResource($this->whenLoaded('shipment')),
        ];
    }
}
