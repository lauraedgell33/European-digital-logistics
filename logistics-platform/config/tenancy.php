<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Multi-Tenancy Configuration
    |--------------------------------------------------------------------------
    */

    // Base domain for subdomain-based tenant resolution
    'base_domain' => env('TENANT_BASE_DOMAIN', 'logimarket.eu'),

    // Whether multi-tenancy is enabled
    'enabled' => env('TENANT_ENABLED', true),

    // Header name for explicit tenant identification (API usage)
    'header' => env('TENANT_HEADER', 'X-Tenant-ID'),

    // Default plan for new tenants
    'default_plan' => env('TENANT_DEFAULT_PLAN', 'starter'),

    // Tenant asset storage disk
    'storage_disk' => env('TENANT_STORAGE_DISK', 'local'),

    // Cache TTL for tenant resolution (seconds)
    'cache_ttl' => env('TENANT_CACHE_TTL', 600),

    // Reserved subdomains (cannot be used by tenants)
    'reserved_subdomains' => [
        'www', 'api', 'admin', 'app', 'mail', 'ftp',
        'staging', 'dev', 'test', 'demo', 'docs',
        'support', 'help', 'status', 'billing',
    ],

];
