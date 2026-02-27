<?php

namespace App\Http\Requests\Tracking;

use Illuminate\Foundation\Http\FormRequest;

class DeviceWebhookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authenticated via API key middleware
    }

    public function rules(): array
    {
        return [
            'device_id' => 'required|string',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'speed' => 'nullable|numeric',
            'heading' => 'nullable|numeric',
            'temperature' => 'nullable|numeric',
            'battery' => 'nullable|integer',
            'timestamp' => 'nullable|date',
        ];
    }
}
