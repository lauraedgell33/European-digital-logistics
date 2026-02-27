<?php

namespace App\Http\Requests\Vehicle;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('create');
    }

    public function rules(): array
    {
        return [
            'vehicle_type' => 'required|string|max:50',
            'vehicle_registration' => 'nullable|string|max:20',
            'capacity_kg' => 'required|numeric|min:0',
            'capacity_m3' => 'nullable|numeric|min:0',
            'loading_meters' => 'nullable|numeric|min:0',
            'pallet_spaces' => 'nullable|integer|min:0',
            'equipment' => 'nullable|array',
            'has_adr' => 'boolean',
            'has_temperature_control' => 'boolean',
            'min_temperature' => 'nullable|numeric',
            'max_temperature' => 'nullable|numeric',
            'current_country' => 'required|string|size:2',
            'current_city' => 'required|string|max:100',
            'current_postal_code' => 'nullable|string|max:20',
            'current_lat' => 'nullable|numeric|between:-90,90',
            'current_lng' => 'nullable|numeric|between:-180,180',
            'destination_country' => 'nullable|string|size:2',
            'destination_city' => 'nullable|string|max:100',
            'available_from' => 'required|date|after_or_equal:today',
            'available_to' => 'nullable|date|after_or_equal:available_from',
            'price_per_km' => 'nullable|numeric|min:0',
            'flat_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'is_public' => 'boolean',
            'network_id' => 'nullable|exists:partner_networks,id',
            'driver_name' => 'nullable|string|max:100',
            'driver_phone' => 'nullable|string|max:30',
            'notes' => 'nullable|string',
        ];
    }
}
