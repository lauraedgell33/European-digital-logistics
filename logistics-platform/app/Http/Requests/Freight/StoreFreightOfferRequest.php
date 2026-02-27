<?php

namespace App\Http\Requests\Freight;

use Illuminate\Foundation\Http\FormRequest;

class StoreFreightOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('create');
    }

    public function rules(): array
    {
        return [
            'origin_country' => 'required|string|size:2',
            'origin_city' => 'required|string|max:100',
            'origin_postal_code' => 'required|string|max:20',
            'origin_lat' => 'nullable|numeric|between:-90,90',
            'origin_lng' => 'nullable|numeric|between:-180,180',
            'origin_address' => 'nullable|string',
            'destination_country' => 'required|string|size:2',
            'destination_city' => 'required|string|max:100',
            'destination_postal_code' => 'required|string|max:20',
            'destination_lat' => 'nullable|numeric|between:-90,90',
            'destination_lng' => 'nullable|numeric|between:-180,180',
            'destination_address' => 'nullable|string',
            'cargo_type' => 'required|string|max:100',
            'cargo_description' => 'nullable|string',
            'weight' => 'required|numeric|min:0',
            'volume' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'loading_meters' => 'nullable|integer|min:0',
            'pallet_count' => 'nullable|integer|min:0',
            'is_hazardous' => 'boolean',
            'adr_class' => 'nullable|string|max:10',
            'requires_temperature_control' => 'boolean',
            'min_temperature' => 'nullable|numeric',
            'max_temperature' => 'nullable|numeric',
            'loading_date' => 'required|date|after_or_equal:today',
            'loading_time_from' => 'nullable|date_format:H:i',
            'loading_time_to' => 'nullable|date_format:H:i',
            'unloading_date' => 'required|date|after_or_equal:loading_date',
            'unloading_time_from' => 'nullable|date_format:H:i',
            'unloading_time_to' => 'nullable|date_format:H:i',
            'vehicle_type' => 'required|string|max:50',
            'required_equipment' => 'nullable|array',
            'price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'price_type' => 'nullable|in:fixed,per_km,negotiable',
            'is_public' => 'boolean',
            'network_id' => 'nullable|exists:partner_networks,id',
            'notes' => 'nullable|string',
            'expires_at' => 'nullable|date|after:now',
        ];
    }
}
