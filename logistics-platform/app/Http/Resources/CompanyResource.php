<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'vat_number' => $this->vat_number,
            'country_code' => $this->country_code,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'logo_url' => $this->logo_url,
            'rating' => $this->rating,
            'verification_status' => $this->verification_status,
            'freight_offers_count' => $this->whenCounted('freightOffers'),
            'vehicle_offers_count' => $this->whenCounted('vehicleOffers'),
            'users_count' => $this->whenCounted('users'),
            'created_at' => $this->created_at?->toIso8601String(),
            'users' => UserResource::collection($this->whenLoaded('users')),
        ];
    }
}
