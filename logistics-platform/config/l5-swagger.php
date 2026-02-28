<?php
// config/l5-swagger.php — L5 Swagger configuration

return [
    'default' => 'default',
    'documentations' => [
        'default' => [
            'api' => [
                'title' => 'LogiMarket API Documentation',
            ],
            'routes' => [
                'api' => 'api/documentation',
                'docs' => 'docs',
                'oauth2_callback' => 'api/oauth2-callback',
                'middleware' => [
                    'api' => [],
                    'asset' => [],
                    'docs' => [],
                    'oauth2_callback' => [],
                ],
            ],
            'paths' => [
                'docs' => storage_path('api-docs'),
                'docs_json' => 'api-docs.json',
                'docs_yaml' => 'api-docs.yaml',
                'annotations' => [
                    base_path('app/Http/Controllers'),
                ],
                'views' => base_path('resources/views/vendor/l5-swagger'),
                'base' => env('L5_SWAGGER_BASE_PATH', null),
                'excludes' => [],
            ],
            'scanOptions' => [
                'analyser' => null,
                'analysis' => null,
                'processors' => [],
                'pattern' => null,
                'exclude' => [],
                'open_api_spec_version' => env('L5_SWAGGER_OPEN_API_SPEC_VERSION', '3.0.0'),
            ],
            'securityDefinitions' => [
                'securitySchemes' => [
                    'sanctum' => [
                        'type' => 'http',
                        'description' => 'Bearer token from /auth/login',
                        'scheme' => 'bearer',
                    ],
                ],
                'security' => [
                    ['sanctum' => []],
                ],
            ],
            'generate_always' => env('L5_SWAGGER_GENERATE_ALWAYS', false),
            'generate_yaml_copy' => env('L5_SWAGGER_GENERATE_YAML_COPY', false),
            'proxy' => false,
            'additional_config_url' => null,
            'operations_sort' => env('L5_SWAGGER_OPERATIONS_SORT', null),
            'validator_url' => null,
            'ui' => [
                'display' => [
                    'dark_mode' => env('L5_SWAGGER_UI_DARK_MODE', false),
                    'doc_expansion' => env('L5_SWAGGER_UI_DOC_EXPANSION', 'none'),
                    'filter' => env('L5_SWAGGER_UI_FILTERS', true),
                ],
                'authorization' => [
                    'persist_authorization' => env('L5_SWAGGER_UI_PERSIST_AUTHORIZATION', true),
                    'oauth2' => [
                        'use_pkce_with_authorization_code_grant' => false,
                    ],
                ],
            ],
            'constants' => [
                'L5_SWAGGER_CONST_HOST' => env('L5_SWAGGER_CONST_HOST', 'http://localhost:8000'),
            ],
        ],
    ],
    'defaults' => [
        'routes' => [
            'docs' => 'docs',
            'oauth2_callback' => 'api/oauth2-callback',
            'middleware' => [
                'api' => [],
                'asset' => [],
                'docs' => [],
                'oauth2_callback' => [],
            ],
            'group_options' => [],
        ],
        'paths' => [
            'docs' => storage_path('api-docs'),
            'views' => base_path('resources/views/vendor/l5-swagger'),
            'base' => env('L5_SWAGGER_BASE_PATH', null),
            'swagger_ui_assets_path' => env('L5_SWAGGER_UI_ASSETS_PATH', 'vendor/swagger-api/swagger-ui/dist/'),
            'excludes' => [],
        ],
        'scanOptions' => [
            'analyser' => null,
            'analysis' => null,
            'processors' => [],
            'pattern' => null,
            'exclude' => [],
            'open_api_spec_version' => env('L5_SWAGGER_OPEN_API_SPEC_VERSION', '3.0.0'),
        ],
        'securityDefinitions' => [
            'securitySchemes' => [],
            'security' => [],
        ],
        'generate_always' => env('L5_SWAGGER_GENERATE_ALWAYS', false),
        'generate_yaml_copy' => env('L5_SWAGGER_GENERATE_YAML_COPY', false),
        'proxy' => false,
        'additional_config_url' => null,
        'operations_sort' => env('L5_SWAGGER_OPERATIONS_SORT', null),
        'validator_url' => null,
        'ui' => [
            'display' => [
                'dark_mode' => false,
                'doc_expansion' => 'none',
                'filter' => true,
            ],
            'authorization' => [
                'persist_authorization' => false,
            ],
        ],
    ],
];
