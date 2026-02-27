<?php

namespace App\Http\Requests\Tender;

use Illuminate\Foundation\Http\FormRequest;

class StoreTenderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('create');
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'route_origin_country' => 'required|string|size:2',
            'route_origin_city' => 'required|string|max:100',
            'route_destination_country' => 'required|string|size:2',
            'route_destination_city' => 'required|string|max:100',
            'additional_stops' => 'nullable|array',
            'cargo_type' => 'nullable|string|max:100',
            'vehicle_type' => 'nullable|string|max:50',
            'estimated_weight' => 'nullable|numeric|min:0',
            'estimated_volume' => 'nullable|numeric|min:0',
            'frequency' => 'required|string|max:50',
            'shipments_per_period' => 'nullable|integer|min:1',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'submission_deadline' => 'required|date|before:start_date',
            'budget' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'budget_type' => 'nullable|in:per_shipment,total,per_month',
            'status' => 'nullable|in:draft,open',
            'max_bidders' => 'nullable|integer|min:1',
            'is_public' => 'boolean',
            'network_id' => 'nullable|exists:partner_networks,id',
            'evaluation_criteria' => 'nullable|array',
            'terms_conditions' => 'nullable|string',
            'required_documents' => 'nullable|array',
        ];
    }
}
