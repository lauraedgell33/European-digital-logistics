<?php

namespace App\Http\Requests\Integration;

use Illuminate\Foundation\Http\FormRequest;

class ImportFreightRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'offers' => 'required|array|min:1|max:100',
            'offers.*.origin_country' => 'required|string|size:2',
            'offers.*.origin_city' => 'required|string',
            'offers.*.origin_postal_code' => 'required|string',
            'offers.*.destination_country' => 'required|string|size:2',
            'offers.*.destination_city' => 'required|string',
            'offers.*.destination_postal_code' => 'required|string',
            'offers.*.cargo_type' => 'required|string',
            'offers.*.weight' => 'required|numeric|min:0',
            'offers.*.loading_date' => 'required|date',
            'offers.*.unloading_date' => 'required|date',
            'offers.*.vehicle_type' => 'required|string',
            'offers.*.price' => 'nullable|numeric',
        ];
    }
}
