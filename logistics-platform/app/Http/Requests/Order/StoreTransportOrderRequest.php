<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransportOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('create');
    }

    public function rules(): array
    {
        return [
            'freight_offer_id' => 'nullable|exists:freight_offers,id',
            'vehicle_offer_id' => 'nullable|exists:vehicle_offers,id',
            'carrier_id' => 'required|exists:companies,id',
            'pickup_country' => 'required|string|size:2',
            'pickup_city' => 'required|string|max:100',
            'pickup_address' => 'required|string',
            'pickup_postal_code' => 'required|string|max:20',
            'pickup_contact_name' => 'nullable|string|max:100',
            'pickup_contact_phone' => 'nullable|string|max:30',
            'pickup_date' => 'required|date|after_or_equal:today',
            'pickup_time_from' => 'nullable|date_format:H:i',
            'pickup_time_to' => 'nullable|date_format:H:i',
            'delivery_country' => 'required|string|size:2',
            'delivery_city' => 'required|string|max:100',
            'delivery_address' => 'required|string',
            'delivery_postal_code' => 'required|string|max:20',
            'delivery_contact_name' => 'nullable|string|max:100',
            'delivery_contact_phone' => 'nullable|string|max:30',
            'delivery_date' => 'required|date|after_or_equal:pickup_date',
            'delivery_time_from' => 'nullable|date_format:H:i',
            'delivery_time_to' => 'nullable|date_format:H:i',
            'cargo_type' => 'required|string|max:100',
            'cargo_description' => 'nullable|string',
            'weight' => 'required|numeric|min:0',
            'volume' => 'nullable|numeric|min:0',
            'pallet_count' => 'nullable|integer|min:0',
            'total_price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'payment_terms' => 'nullable|in:prepaid,30_days,60_days,90_days',
            'special_instructions' => 'nullable|string',
        ];
    }
}
