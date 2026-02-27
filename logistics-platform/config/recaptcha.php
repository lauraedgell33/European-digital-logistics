<?php

return [
    /*
    |--------------------------------------------------------------------------
    | reCAPTCHA v3 Configuration
    |--------------------------------------------------------------------------
    |
    | Set RECAPTCHA_ENABLED=true and provide your Google reCAPTCHA v3 keys
    | to enable bot protection on authentication forms.
    |
    */

    'enabled' => env('RECAPTCHA_ENABLED', false),
    'site_key' => env('RECAPTCHA_SITE_KEY', ''),
    'secret_key' => env('RECAPTCHA_SECRET_KEY', ''),
    'min_score' => env('RECAPTCHA_MIN_SCORE', 0.5),
    'verify_url' => 'https://www.google.com/recaptcha/api/siteverify',
];
