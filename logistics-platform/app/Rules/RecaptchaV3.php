<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;

class RecaptchaV3 implements ValidationRule
{
    public function __construct(
        protected string $action = 'submit',
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Skip validation if reCAPTCHA is disabled
        if (!config('recaptcha.enabled')) {
            return;
        }

        if (empty($value)) {
            $fail('reCAPTCHA verification is required.');
            return;
        }

        $response = Http::asForm()->post(config('recaptcha.verify_url'), [
            'secret' => config('recaptcha.secret_key'),
            'response' => $value,
            'remoteip' => request()->ip(),
        ]);

        $result = $response->json();

        if (!($result['success'] ?? false)) {
            $fail('reCAPTCHA verification failed. Please try again.');
            return;
        }

        // Verify the action matches
        if (isset($result['action']) && $result['action'] !== $this->action) {
            $fail('reCAPTCHA action mismatch.');
            return;
        }

        // Check the score (v3 returns 0.0 to 1.0, higher = more likely human)
        $score = $result['score'] ?? 0;
        if ($score < config('recaptcha.min_score', 0.5)) {
            $fail('reCAPTCHA score too low. Please try again.');
        }
    }
}
