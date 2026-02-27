<?php

namespace App\Http\Requests\Tracking;

use Illuminate\Foundation\Http\FormRequest;

class AddShipmentEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $shipment = $this->route('shipment');
        $order = $shipment->transportOrder;

        return $order && (
            $this->user()->company_id === $order->shipper_id
            || $this->user()->company_id === $order->carrier_id
        );
    }

    public function rules(): array
    {
        return [
            'event_type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array',
        ];
    }
}
