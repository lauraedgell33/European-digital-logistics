<?php

namespace App\Http\Requests\Auth;

use App\Rules\RecaptchaV3;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'email' => 'required|email',
            'password' => 'required',
        ];

        if (config('recaptcha.enabled')) {
            $rules['recaptcha_token'] = ['required', 'string', new RecaptchaV3('login')];
        }

        return $rules;
    }
}
