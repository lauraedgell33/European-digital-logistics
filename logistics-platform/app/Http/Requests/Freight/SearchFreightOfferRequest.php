<?php

namespace App\Http\Requests\Freight;

use Illuminate\Foundation\Http\FormRequest;

class SearchFreightOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'origin_country' => 'nullable|string|size:2',
            'origin_city' => 'nullable|string',
            'destination_country' => 'nullable|string|size:2',
            'destination_city' => 'nullable|string',
            'loading_date_from' => 'nullable|date',
            'loading_date_to' => 'nullable|date',
            'vehicle_type' => 'nullable|string',
            'max_weight' => 'nullable|numeric',
            'min_weight' => 'nullable|numeric',
            'max_price' => 'nullable|numeric',
            'radius_km' => 'nullable|integer|min:1|max:500',
            'origin_lat' => 'nullable|numeric',
            'origin_lng' => 'nullable|numeric',
        ];
    }
}
