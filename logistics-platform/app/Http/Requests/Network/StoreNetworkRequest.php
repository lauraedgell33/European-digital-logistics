<?php

namespace App\Http\Requests\Network;

use Illuminate\Foundation\Http\FormRequest;

class StoreNetworkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermission('create');
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_members' => 'nullable|integer|min:2',
            'settings' => 'nullable|array',
        ];
    }
}
