<?php

namespace App\Http\Requests\Vehicle;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->company_id === $this->route('vehicle')->company_id
            && $this->user()->hasPermission('edit');
    }

    public function rules(): array
    {
        return [
            'vehicle_type' => 'sometimes|string|max:50',
            'capacity_kg' => 'sometimes|numeric|min:0',
            'current_country' => 'sometimes|string|size:2',
            'current_city' => 'sometimes|string|max:100',
            'available_from' => 'sometimes|date',
            'available_to' => 'nullable|date',
            'price_per_km' => 'nullable|numeric|min:0',
            'flat_price' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:available,unavailable',
            'notes' => 'nullable|string',
        ];
    }
}
