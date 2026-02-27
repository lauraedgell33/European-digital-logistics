<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleOfferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vehicle_type' => $this->vehicle_type,
            'vehicle_registration' => $this->vehicle_registration,
            'capacity_kg' => $this->capacity_kg,
            'capacity_m3' => $this->capacity_m3,
            'loading_meters' => $this->loading_meters,
            'pallet_spaces' => $this->pallet_spaces,
            'equipment' => $this->equipment,
            'has_adr' => (bool) $this->has_adr,
            'has_temperature_control' => (bool) $this->has_temperature_control,
            'min_temperature' => $this->min_temperature,
            'max_temperature' => $this->max_temperature,
            'current_country' => $this->current_country,
            'current_city' => $this->current_city,
            'current_postal_code' => $this->current_postal_code,
            'current_lat' => $this->current_lat,
            'current_lng' => $this->current_lng,
            'destination_country' => $this->destination_country,
            'destination_city' => $this->destination_city,
            'available_from' => $this->available_from?->toDateString(),
            'available_to' => $this->available_to?->toDateString(),
            'price_per_km' => $this->price_per_km,
            'flat_price' => $this->flat_price,
            'currency' => $this->currency,
            'status' => $this->status,
            'is_public' => (bool) $this->is_public,
            'driver_name' => $this->driver_name,
            'driver_phone' => $this->driver_phone,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'company' => new CompanyResource($this->whenLoaded('company')),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
