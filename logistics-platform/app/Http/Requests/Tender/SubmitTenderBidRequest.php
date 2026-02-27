<?php

namespace App\Http\Requests\Tender;

use Illuminate\Foundation\Http\FormRequest;

class SubmitTenderBidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('create');
    }

    public function rules(): array
    {
        return [
            'proposed_price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'proposal' => 'required|string',
            'transit_time_hours' => 'nullable|integer|min:1',
            'additional_services' => 'nullable|string',
            'pricing_breakdown' => 'nullable|array',
        ];
    }
}
