<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $order = $this->route('order');
        $companyId = $this->user()->company_id;

        return $order->shipper_id === $companyId || $order->carrier_id === $companyId;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:picked_up,in_transit,delivered,completed,cancelled',
            'reason' => 'nullable|string',
        ];
    }
}
