<?php

namespace App\Http\Requests\Auth;

use App\Rules\RecaptchaV3;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            // Company
            'company_name' => 'required|string|max:255',
            'vat_number' => 'required|string|max:50|unique:companies,vat_number',
            'company_type' => 'required|in:shipper,carrier,forwarder',
            'country_code' => 'required|string|size:2',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'company_phone' => 'nullable|string|max:30',
            'company_email' => 'nullable|email',
            'website' => 'nullable|url',
            // User
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'language' => 'nullable|string|max:5',
        ];

        if (config('recaptcha.enabled')) {
            $rules['recaptcha_token'] = ['required', 'string', new RecaptchaV3('register')];
        }

        return $rules;
    }
}
