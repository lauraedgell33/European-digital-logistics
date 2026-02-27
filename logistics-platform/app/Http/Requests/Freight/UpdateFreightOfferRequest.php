<?php

namespace App\Http\Requests\Freight;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFreightOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->company_id === $this->route('freight')->company_id
            && $this->user()->hasPermission('edit');
    }

    public function rules(): array
    {
        return [
            'origin_country' => 'sometimes|string|size:2',
            'origin_city' => 'sometimes|string|max:100',
            'destination_country' => 'sometimes|string|size:2',
            'destination_city' => 'sometimes|string|max:100',
            'cargo_type' => 'sometimes|string|max:100',
            'weight' => 'sometimes|numeric|min:0',
            'volume' => 'nullable|numeric|min:0',
            'loading_date' => 'sometimes|date',
            'unloading_date' => 'sometimes|date',
            'vehicle_type' => 'sometimes|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'status' => 'sometimes|in:active,cancelled',
            'notes' => 'nullable|string',
        ];
    }
}
