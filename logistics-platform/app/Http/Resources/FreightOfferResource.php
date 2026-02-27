<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FreightOfferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'origin_country' => $this->origin_country,
            'origin_city' => $this->origin_city,
            'origin_postal_code' => $this->origin_postal_code,
            'origin_lat' => $this->origin_lat,
            'origin_lng' => $this->origin_lng,
            'origin_address' => $this->origin_address,
            'destination_country' => $this->destination_country,
            'destination_city' => $this->destination_city,
            'destination_postal_code' => $this->destination_postal_code,
            'destination_lat' => $this->destination_lat,
            'destination_lng' => $this->destination_lng,
            'destination_address' => $this->destination_address,
            'cargo_type' => $this->cargo_type,
            'cargo_description' => $this->cargo_description,
            'weight' => $this->weight,
            'volume' => $this->volume,
            'length' => $this->length,
            'width' => $this->width,
            'height' => $this->height,
            'loading_meters' => $this->loading_meters,
            'pallet_count' => $this->pallet_count,
            'is_hazardous' => (bool) $this->is_hazardous,
            'adr_class' => $this->adr_class,
            'requires_temperature_control' => (bool) $this->requires_temperature_control,
            'min_temperature' => $this->min_temperature,
            'max_temperature' => $this->max_temperature,
            'loading_date' => $this->loading_date?->toDateString(),
            'loading_time_from' => $this->loading_time_from,
            'loading_time_to' => $this->loading_time_to,
            'unloading_date' => $this->unloading_date?->toDateString(),
            'unloading_time_from' => $this->unloading_time_from,
            'unloading_time_to' => $this->unloading_time_to,
            'vehicle_type' => $this->vehicle_type,
            'required_equipment' => $this->required_equipment,
            'price' => $this->price,
            'currency' => $this->currency,
            'price_type' => $this->price_type,
            'distance_km' => $this->distance_km,
            'status' => $this->status,
            'is_public' => (bool) $this->is_public,
            'notes' => $this->notes,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'company' => new CompanyResource($this->whenLoaded('company')),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
