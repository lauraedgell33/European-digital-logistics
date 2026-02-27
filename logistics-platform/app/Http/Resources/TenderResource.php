<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'route_origin_country' => $this->route_origin_country,
            'route_origin_city' => $this->route_origin_city,
            'route_destination_country' => $this->route_destination_country,
            'route_destination_city' => $this->route_destination_city,
            'additional_stops' => $this->additional_stops,
            'cargo_type' => $this->cargo_type,
            'vehicle_type' => $this->vehicle_type,
            'estimated_weight' => $this->estimated_weight,
            'estimated_volume' => $this->estimated_volume,
            'frequency' => $this->frequency,
            'shipments_per_period' => $this->shipments_per_period,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'submission_deadline' => $this->submission_deadline?->toDateString(),
            'budget' => $this->budget,
            'currency' => $this->currency,
            'budget_type' => $this->budget_type,
            'status' => $this->status,
            'max_bidders' => $this->max_bidders,
            'is_public' => (bool) $this->is_public,
            'evaluation_criteria' => $this->evaluation_criteria,
            'terms_conditions' => $this->terms_conditions,
            'required_documents' => $this->required_documents,
            'bids_count' => $this->whenCounted('bids'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'company' => new CompanyResource($this->whenLoaded('company')),
            'user' => new UserResource($this->whenLoaded('user')),
            'bids' => TenderBidResource::collection($this->whenLoaded('bids')),
        ];
    }
}
