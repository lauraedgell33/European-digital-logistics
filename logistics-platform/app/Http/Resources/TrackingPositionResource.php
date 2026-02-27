<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrackingPositionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'speed_kmh' => $this->speed_kmh,
            'heading' => $this->heading,
            'temperature' => $this->temperature,
            'recorded_at' => $this->recorded_at?->toIso8601String(),
        ];
    }
}
