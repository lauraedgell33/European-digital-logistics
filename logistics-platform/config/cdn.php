<?php

return [
    /*
    |--------------------------------------------------------------------------
    | CDN Configuration
    |--------------------------------------------------------------------------
    |
    | Configure CDN settings for static asset delivery, cache invalidation,
    | and origin shield. Supports CloudFront, Cloudflare, and BunnyCDN.
    |
    */

    'enabled' => env('CDN_ENABLED', false),

    'provider' => env('CDN_PROVIDER', 'cloudfront'),

    'domain' => env('CDN_DOMAIN', 'cdn.logimarket.eu'),

    'distribution_id' => env('CDN_DISTRIBUTION_ID', ''),

    /*
    |--------------------------------------------------------------------------
    | Cache Rules
    |--------------------------------------------------------------------------
    */
    'cache' => [
        // Static assets — immutable, long cache
        'static' => [
            'max_age' => 31536000, // 1 year
            'immutable' => true,
            'extensions' => ['js', 'css', 'png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'],
        ],

        // API responses — no CDN cache
        'api' => [
            'max_age' => 0,
            'no_cache' => true,
            'private' => true,
        ],

        // HTML pages — short cache with revalidation
        'html' => [
            'max_age' => 300,        // 5 min browser
            's_maxage' => 600,       // 10 min CDN
            'stale_while_revalidate' => 86400, // 24h stale
        ],

        // Uploaded files — medium cache
        'uploads' => [
            'max_age' => 86400,      // 1 day
            's_maxage' => 604800,    // 1 week CDN
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Image Optimization
    |--------------------------------------------------------------------------
    */
    'images' => [
        'optimization' => env('CDN_IMAGE_OPTIMIZATION', true),
        'formats' => ['webp', 'avif'],
        'quality' => 80,
        'max_width' => 2560,
        'responsive_sizes' => [320, 640, 768, 1024, 1280, 1920, 2560],
        'lazy_loading' => true,
        'placeholder' => 'blur', // blur | color | none
    ],

    /*
    |--------------------------------------------------------------------------
    | Compression
    |--------------------------------------------------------------------------
    */
    'compression' => [
        'brotli' => true,
        'gzip' => true,
        'min_size' => 1024, // Only compress files > 1KB
    ],

    /*
    |--------------------------------------------------------------------------
    | Security
    |--------------------------------------------------------------------------
    */
    'security' => [
        'signed_urls' => env('CDN_SIGNED_URLS', false),
        'signed_url_ttl' => 3600,
        'key_pair_id' => env('CDN_KEY_PAIR_ID', ''),
        'private_key_path' => env('CDN_PRIVATE_KEY_PATH', ''),
        'allowed_origins' => [
            'https://logimarket.eu',
            'https://*.logimarket.eu',
        ],
        'waf_enabled' => env('CDN_WAF_ENABLED', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Origin Shield
    |--------------------------------------------------------------------------
    */
    'origin_shield' => [
        'enabled' => env('CDN_ORIGIN_SHIELD', true),
        'region' => env('CDN_SHIELD_REGION', 'eu-central-1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Invalidation
    |--------------------------------------------------------------------------
    */
    'invalidation' => [
        'on_deploy' => true,
        'paths' => ['/*'],
        'batch_size' => 3000,
    ],

    /*
    |--------------------------------------------------------------------------
    | Provider-Specific Settings
    |--------------------------------------------------------------------------
    */
    'cloudfront' => [
        'distribution_id' => env('CLOUDFRONT_DISTRIBUTION_ID', ''),
        'key' => env('AWS_ACCESS_KEY_ID', ''),
        'secret' => env('AWS_SECRET_ACCESS_KEY', ''),
        'region' => env('AWS_DEFAULT_REGION', 'eu-central-1'),
    ],

    'cloudflare' => [
        'zone_id' => env('CLOUDFLARE_ZONE_ID', ''),
        'api_token' => env('CLOUDFLARE_API_TOKEN', ''),
        'minify' => ['javascript' => true, 'css' => true, 'html' => true],
        'polish' => 'lossy', // off | lossless | lossy
        'rocket_loader' => false,
    ],

    'bunnycdn' => [
        'pull_zone_id' => env('BUNNYCDN_PULL_ZONE_ID', ''),
        'api_key' => env('BUNNYCDN_API_KEY', ''),
        'storage_zone' => env('BUNNYCDN_STORAGE_ZONE', ''),
    ],
];
