<?php

return [
    'dsn' => env('SENTRY_LARAVEL_DSN', env('SENTRY_DSN')),

    // capture release as git SHA
    'release' => env('SENTRY_RELEASE'),

    // Set a sampling rate for unsampled requests
    'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 0.2),

    // Set a sampling rate for profiling (requires traces to be enabled)
    'profiles_sample_rate' => (float) env('SENTRY_PROFILES_SAMPLE_RATE', 0.1),

    // Performance monitoring
    'send_default_pii' => env('SENTRY_SEND_DEFAULT_PII', false),

    'environment' => env('SENTRY_ENVIRONMENT', env('APP_ENV', 'production')),

    'breadcrumbs' => [
        // Capture Laravel logs as breadcrumbs
        'logs' => true,

        // Capture SQL queries as breadcrumbs
        'sql_queries' => true,

        // Capture bindings on SQL queries logged as breadcrumbs
        'sql_bindings' => true,

        // Capture queue job information as breadcrumbs
        'queue_info' => true,

        // Capture command information as breadcrumbs
        'command_info' => true,

        // Capture HTTP client requests information as breadcrumbs
        'http_client_requests' => true,
    ],

    // @see: https://docs.sentry.io/platforms/php/guides/laravel/configuration/options/#before-send
    'before_send' => null,

    // @see: https://docs.sentry.io/platforms/php/guides/laravel/configuration/options/#before-send-transaction
    'before_send_transaction' => null,

    // Context tags
    'tags' => [
        'app' => 'logimarket',
        'platform' => 'logistics',
    ],

    // Controllers that should not be traced for performance
    'controllers_base_namespace' => env('SENTRY_CONTROLLERS_BASE_NAMESPACE', 'App\\Http\\Controllers'),
];
