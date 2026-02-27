<?php

namespace App\Http\Requests\Tracking;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Carrier company can update position
        $shipment = $this->route('shipment');
        $order = $shipment->transportOrder;

        return $order && $this->user()->company_id === $order->carrier_id;
    }

    public function rules(): array
    {
        return [
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'speed_kmh' => 'nullable|numeric|min:0',
            'heading' => 'nullable|numeric|between:0,360',
            'temperature' => 'nullable|numeric',
        ];
    }
}
