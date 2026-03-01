<?php

namespace App\Search;

/**
 * Elasticsearch index settings and mappings for all searchable models.
 * Used by the custom scout:configure-indices Artisan command.
 */
class ElasticsearchIndexConfig
{
    /**
     * Shared analyzer settings for all indices.
     */
    public static function analysisSettings(): array
    {
        return [
            'analysis' => [
                'analyzer' => [
                    'autocomplete' => [
                        'type' => 'custom',
                        'tokenizer' => 'autocomplete_tokenizer',
                        'filter' => ['lowercase', 'asciifolding'],
                    ],
                    'autocomplete_search' => [
                        'type' => 'custom',
                        'tokenizer' => 'standard',
                        'filter' => ['lowercase', 'asciifolding'],
                    ],
                    'multilingual' => [
                        'type' => 'custom',
                        'tokenizer' => 'standard',
                        'filter' => ['lowercase', 'asciifolding', 'snowball_filter'],
                    ],
                ],
                'tokenizer' => [
                    'autocomplete_tokenizer' => [
                        'type' => 'edge_ngram',
                        'min_gram' => 2,
                        'max_gram' => 15,
                        'token_chars' => ['letter', 'digit'],
                    ],
                ],
                'filter' => [
                    'snowball_filter' => [
                        'type' => 'snowball',
                        'language' => 'English',
                    ],
                ],
            ],
        ];
    }

    /**
     * FreightOffer index mapping.
     */
    public static function freightOfferMapping(): array
    {
        return [
            'properties' => [
                // IDs
                'company_id' => ['type' => 'integer'],
                'user_id' => ['type' => 'integer'],
                'network_id' => ['type' => 'integer'],

                // Origin
                'origin_country' => ['type' => 'keyword'],
                'origin_city' => [
                    'type' => 'text',
                    'analyzer' => 'autocomplete',
                    'search_analyzer' => 'autocomplete_search',
                    'fields' => [
                        'keyword' => ['type' => 'keyword'],
                    ],
                ],
                'origin_postal_code' => ['type' => 'keyword'],
                'origin_location' => ['type' => 'geo_point'],

                // Destination
                'destination_country' => ['type' => 'keyword'],
                'destination_city' => [
                    'type' => 'text',
                    'analyzer' => 'autocomplete',
                    'search_analyzer' => 'autocomplete_search',
                    'fields' => [
                        'keyword' => ['type' => 'keyword'],
                    ],
                ],
                'destination_postal_code' => ['type' => 'keyword'],
                'destination_location' => ['type' => 'geo_point'],

                // Cargo
                'cargo_type' => ['type' => 'keyword'],
                'cargo_description' => [
                    'type' => 'text',
                    'analyzer' => 'multilingual',
                ],
                'weight' => ['type' => 'float'],
                'volume' => ['type' => 'float'],
                'loading_meters' => ['type' => 'float'],
                'pallet_count' => ['type' => 'integer'],

                // Requirements
                'is_hazardous' => ['type' => 'boolean'],
                'adr_class' => ['type' => 'keyword'],
                'requires_temperature_control' => ['type' => 'boolean'],
                'vehicle_type' => ['type' => 'keyword'],
                'required_equipment' => ['type' => 'keyword'],

                // Dates
                'loading_date' => ['type' => 'date', 'format' => 'yyyy-MM-dd||epoch_millis'],
                'unloading_date' => ['type' => 'date', 'format' => 'yyyy-MM-dd||epoch_millis'],
                'expires_at' => ['type' => 'date'],

                // Pricing
                'price' => ['type' => 'float'],
                'currency' => ['type' => 'keyword'],
                'price_type' => ['type' => 'keyword'],

                // Status
                'status' => ['type' => 'keyword'],
                'is_public' => ['type' => 'boolean'],

                // Route
                'distance_km' => ['type' => 'float'],
                'estimated_duration_hours' => ['type' => 'float'],

                // Full-text
                'notes' => ['type' => 'text', 'analyzer' => 'multilingual'],
                'origin_address' => ['type' => 'text', 'analyzer' => 'autocomplete', 'search_analyzer' => 'autocomplete_search'],
                'destination_address' => ['type' => 'text', 'analyzer' => 'autocomplete', 'search_analyzer' => 'autocomplete_search'],

                // Timestamps
                'created_at' => ['type' => 'date'],
                'updated_at' => ['type' => 'date'],
            ],
        ];
    }

    /**
     * VehicleOffer index mapping.
     */
    public static function vehicleOfferMapping(): array
    {
        return [
            'properties' => [
                'company_id' => ['type' => 'integer'],
                'user_id' => ['type' => 'integer'],
                'network_id' => ['type' => 'integer'],

                // Vehicle
                'vehicle_type' => ['type' => 'keyword'],
                'vehicle_registration' => ['type' => 'keyword'],
                'capacity_kg' => ['type' => 'float'],
                'capacity_m3' => ['type' => 'float'],
                'loading_meters' => ['type' => 'float'],
                'pallet_spaces' => ['type' => 'integer'],
                'equipment' => ['type' => 'keyword'],
                'has_adr' => ['type' => 'boolean'],
                'has_temperature_control' => ['type' => 'boolean'],

                // Current location
                'current_country' => ['type' => 'keyword'],
                'current_city' => [
                    'type' => 'text',
                    'analyzer' => 'autocomplete',
                    'search_analyzer' => 'autocomplete_search',
                    'fields' => [
                        'keyword' => ['type' => 'keyword'],
                    ],
                ],
                'current_postal_code' => ['type' => 'keyword'],
                'current_location' => ['type' => 'geo_point'],

                // Destination
                'destination_country' => ['type' => 'keyword'],
                'destination_city' => [
                    'type' => 'text',
                    'analyzer' => 'autocomplete',
                    'search_analyzer' => 'autocomplete_search',
                    'fields' => [
                        'keyword' => ['type' => 'keyword'],
                    ],
                ],

                // Availability
                'available_from' => ['type' => 'date', 'format' => 'yyyy-MM-dd||epoch_millis'],
                'available_to' => ['type' => 'date', 'format' => 'yyyy-MM-dd||epoch_millis'],

                // Pricing
                'price_per_km' => ['type' => 'float'],
                'flat_price' => ['type' => 'float'],
                'currency' => ['type' => 'keyword'],

                // Status
                'status' => ['type' => 'keyword'],
                'is_public' => ['type' => 'boolean'],

                // Driver
                'driver_name' => [
                    'type' => 'text',
                    'analyzer' => 'autocomplete',
                    'search_analyzer' => 'autocomplete_search',
                ],

                // Full-text
                'notes' => ['type' => 'text', 'analyzer' => 'multilingual'],

                'created_at' => ['type' => 'date'],
                'updated_at' => ['type' => 'date'],
            ],
        ];
    }

    /**
     * Company index mapping.
     */
    public static function companyMapping(): array
    {
        return [
            'properties' => [
                'name' => [
                    'type' => 'text',
                    'analyzer' => 'autocomplete',
                    'search_analyzer' => 'autocomplete_search',
                    'fields' => [
                        'keyword' => ['type' => 'keyword'],
                        'raw' => ['type' => 'keyword'],
                    ],
                ],
                'vat_number' => ['type' => 'keyword'],
                'registration_number' => ['type' => 'keyword'],
                'type' => ['type' => 'keyword'],
                'verification_status' => ['type' => 'keyword'],
                'country_code' => ['type' => 'keyword'],
                'address' => [
                    'type' => 'text',
                    'analyzer' => 'autocomplete',
                    'search_analyzer' => 'autocomplete_search',
                ],
                'city' => [
                    'type' => 'text',
                    'analyzer' => 'autocomplete',
                    'search_analyzer' => 'autocomplete_search',
                    'fields' => [
                        'keyword' => ['type' => 'keyword'],
                    ],
                ],
                'postal_code' => ['type' => 'keyword'],
                'email' => ['type' => 'keyword'],
                'website' => ['type' => 'keyword'],
                'rating' => ['type' => 'float'],
                'total_reviews' => ['type' => 'integer'],
                'is_active' => ['type' => 'boolean'],
                'verified_at' => ['type' => 'date'],
                'created_at' => ['type' => 'date'],
                'updated_at' => ['type' => 'date'],
            ],
        ];
    }

    /**
     * LexiconArticle index mapping.
     */
    public static function lexiconArticleMapping(): array
    {
        return [
            'properties' => [
                'slug' => ['type' => 'keyword'],
                'title' => [
                    'type' => 'text',
                    'analyzer' => 'multilingual',
                    'fields' => [
                        'autocomplete' => [
                            'type' => 'text',
                            'analyzer' => 'autocomplete',
                            'search_analyzer' => 'autocomplete_search',
                        ],
                        'keyword' => ['type' => 'keyword'],
                    ],
                ],
                'excerpt' => [
                    'type' => 'text',
                    'analyzer' => 'multilingual',
                ],
                'content' => [
                    'type' => 'text',
                    'analyzer' => 'multilingual',
                ],
                'category' => ['type' => 'keyword'],
                'tags' => ['type' => 'keyword'],
                'language' => ['type' => 'keyword'],
                'is_published' => ['type' => 'boolean'],
                'view_count' => ['type' => 'integer'],
                'author_id' => ['type' => 'integer'],
                'created_at' => ['type' => 'date'],
                'updated_at' => ['type' => 'date'],
            ],
        ];
    }

    /**
     * Get all index configs keyed by model searchable index name.
     */
    public static function all(): array
    {
        return [
            'freight_offers' => [
                'settings' => self::analysisSettings(),
                'mappings' => self::freightOfferMapping(),
            ],
            'vehicle_offers' => [
                'settings' => self::analysisSettings(),
                'mappings' => self::vehicleOfferMapping(),
            ],
            'companies' => [
                'settings' => self::analysisSettings(),
                'mappings' => self::companyMapping(),
            ],
            'lexicon_articles' => [
                'settings' => self::analysisSettings(),
                'mappings' => self::lexiconArticleMapping(),
            ],
        ];
    }
}
