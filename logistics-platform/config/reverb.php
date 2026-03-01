<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Reverb WebSocket Server Configuration
    |--------------------------------------------------------------------------
    |
    | Reverb is Laravel's first-party WebSocket server. This config controls
    | the server settings, scaling via Redis pub/sub for horizontal scaling,
    | and application-level channel/event settings.
    |
    */

    'default' => env('REVERB_SERVER', 'reverb'),

    'servers' => [
        'reverb' => [
            'host' => env('REVERB_SERVER_HOST', '0.0.0.0'),
            'port' => env('REVERB_SERVER_PORT', 8080),
            'hostname' => env('REVERB_HOST'),
            'options' => [
                'tls' => [],
            ],
            'max_request_size' => env('REVERB_MAX_REQUEST_SIZE', 10_000),
            'scaling' => [
                'enabled' => env('REVERB_SCALING_ENABLED', true),
                'channel' => env('REVERB_SCALING_CHANNEL', 'reverb'),
                'server' => [
                    // Redis connection for pub/sub cluster scaling
                    'url' => env('REDIS_URL'),
                    'host' => env('REDIS_HOST', '127.0.0.1'),
                    'port' => env('REDIS_PORT', '6379'),
                    'username' => env('REDIS_USERNAME'),
                    'password' => env('REDIS_PASSWORD'),
                    'database' => env('REVERB_SCALING_DB', '3'),
                ],
            ],
            'pulse_ingest_interval' => env('REVERB_PULSE_INTERVAL', 15),
            'telescope_ingest_interval' => env('REVERB_TELESCOPE_INTERVAL', 15),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Reverb Applications
    |--------------------------------------------------------------------------
    */
    'apps' => [
        [
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'options' => [
                'host' => env('REVERB_HOST'),
                'port' => env('REVERB_PORT', 443),
                'scheme' => env('REVERB_SCHEME', 'https'),
                'useTLS' => env('REVERB_SCHEME', 'https') === 'https',
            ],
            'allowed_origins' => [
                env('APP_URL', 'http://localhost'),
                env('FRONTEND_URL', 'http://localhost:3000'),
            ],
            'ping_interval' => env('REVERB_APP_PING_INTERVAL', 60),
            'activity_timeout' => env('REVERB_APP_ACTIVITY_TIMEOUT', 120),
            'max_message_size' => env('REVERB_APP_MAX_MESSAGE_SIZE', 10_000),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cluster Settings — Horizontal Scaling
    |--------------------------------------------------------------------------
    |
    | When running multiple Reverb instances behind a load balancer,
    | Redis pub/sub synchronizes channel subscriptions and messages
    | across all nodes. Each node subscribes to the scaling channel
    | and re-broadcasts received events to local connections.
    |
    | Required env vars for cluster mode:
    |   REVERB_SCALING_ENABLED=true
    |   REVERB_SCALING_CHANNEL=reverb
    |   REDIS_HOST / REDIS_PORT (shared across all nodes)
    |
    | Topology:
    |   Client → LB (sticky WS) → Reverb Node 1 ─┐
    |   Client → LB (sticky WS) → Reverb Node 2 ──┤── Redis Pub/Sub
    |   Client → LB (sticky WS) → Reverb Node N ──┘
    |
    */

    'cluster' => [
        // Number of expected nodes (informational)
        'expected_nodes' => env('REVERB_CLUSTER_NODES', 2),

        // Health check interval in seconds
        'health_interval' => env('REVERB_HEALTH_INTERVAL', 30),

        // Redis database for cluster state
        'state_db' => env('REVERB_STATE_DB', '4'),

        // Node heartbeat TTL in seconds
        'heartbeat_ttl' => env('REVERB_HEARTBEAT_TTL', 60),

        // Channels that require presence data across nodes
        'presence_channels' => [
            'presence-tracking.*',
            'presence-chat.*',
            'presence-order.*',
        ],
    ],
];
