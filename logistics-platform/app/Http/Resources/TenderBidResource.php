<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenderBidResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tender_id' => $this->tender_id,
            'proposed_price' => $this->proposed_price,
            'currency' => $this->currency,
            'proposal' => $this->proposal,
            'transit_time_hours' => $this->transit_time_hours,
            'additional_services' => $this->additional_services,
            'pricing_breakdown' => $this->pricing_breakdown,
            'status' => $this->status,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'company' => new CompanyResource($this->whenLoaded('company')),
            'user' => new UserResource($this->whenLoaded('user')),
            'tender' => new TenderResource($this->whenLoaded('tender')),
        ];
    }
}
