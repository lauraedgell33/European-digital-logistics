<?php

namespace App\Services;

use App\Models\ErpIntegration;
use App\Models\TransportOrder;
use App\Models\FreightOffer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Transport Management System (TMS) connectors.
 *
 * Supports: Transporeon, Timocom, Sixfold, project44, FourKites,
 *           Alpega/Teleroute, and generic REST-based TMS APIs.
 */
class TmsConnectorService
{
    // ── Supported TMS providers ────────────────────────────────
    public const TMS_TRANSPOREON = 'transporeon';
    public const TMS_TIMOCOM = 'timocom';
    public const TMS_SIXFOLD = 'sixfold';
    public const TMS_PROJECT44 = 'project44';
    public const TMS_FOURKITES = 'fourkites';
    public const TMS_ALPEGA = 'alpega';
    public const TMS_GENERIC = 'custom_tms';

    /**
     * All supported providers with capabilities.
     */
    public function getSupportedProviders(): array
    {
        return [
            self::TMS_TRANSPOREON => [
                'name' => 'Transporeon',
                'capabilities' => ['freight_matching', 'tender', 'tracking', 'analytics', 'dock_scheduling'],
                'auth_type' => 'oauth2',
                'api_docs' => 'https://developer.transporeon.com',
                'region' => 'EU',
            ],
            self::TMS_TIMOCOM => [
                'name' => 'TIMOCOM',
                'capabilities' => ['freight_exchange', 'vehicle_exchange', 'company_directory', 'route_planner'],
                'auth_type' => 'api_key',
                'api_docs' => 'https://developer.timocom.com',
                'region' => 'EU',
            ],
            self::TMS_SIXFOLD => [
                'name' => 'Sixfold (Transporeon Visibility)',
                'capabilities' => ['real_time_tracking', 'eta_prediction', 'geofencing'],
                'auth_type' => 'api_key',
                'api_docs' => 'https://sixfold.com/api',
                'region' => 'EU',
            ],
            self::TMS_PROJECT44 => [
                'name' => 'project44',
                'capabilities' => ['tracking', 'eta', 'ocean_tracking', 'parcel_tracking', 'ltl_tracking'],
                'auth_type' => 'oauth2',
                'api_docs' => 'https://developer.project44.com',
                'region' => 'Global',
            ],
            self::TMS_FOURKITES => [
                'name' => 'FourKites',
                'capabilities' => ['tracking', 'eta', 'yard_management', 'ocean_visibility'],
                'auth_type' => 'api_key',
                'api_docs' => 'https://developer.fourkites.com',
                'region' => 'Global',
            ],
            self::TMS_ALPEGA => [
                'name' => 'Alpega (Teleroute)',
                'capabilities' => ['freight_exchange', 'benchmarking', 'tendering', 'tms'],
                'auth_type' => 'api_key',
                'api_docs' => 'https://www.alpegagroup.com',
                'region' => 'EU',
            ],
            self::TMS_GENERIC => [
                'name' => 'Custom TMS',
                'capabilities' => ['orders', 'tracking', 'reporting'],
                'auth_type' => 'api_key',
                'region' => 'Any',
            ],
        ];
    }

    /**
     * Publish a freight offer to an external TMS/exchange.
     */
    public function publishFreight(ErpIntegration $integration, FreightOffer $freight): array
    {
        $config = $integration->connection_config ?? [];
        $provider = $integration->integration_type;

        $payload = match ($provider) {
            self::TMS_TRANSPOREON => $this->formatTransporeonFreight($freight),
            self::TMS_TIMOCOM => $this->formatTimocomFreight($freight),
            self::TMS_ALPEGA => $this->formatAlpegaFreight($freight),
            default => $this->formatGenericFreight($freight),
        };

        $endpoint = $this->getPublishEndpoint($provider, $config);

        try {
            $response = Http::timeout(15)
                ->withHeaders($this->buildHeaders($integration))
                ->post($endpoint, $payload);

            if ($response->successful()) {
                return [
                    'published' => true,
                    'external_id' => $response->json('id') ?? $response->json('data.id'),
                    'provider' => $provider,
                    'url' => $response->json('url') ?? null,
                ];
            }

            return ['published' => false, 'error' => "HTTP {$response->status()}: {$response->body()}"];
        } catch (\Exception $e) {
            return ['published' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Fetch available loads from a TMS exchange.
     */
    public function fetchAvailableLoads(ErpIntegration $integration, array $filters = []): array
    {
        $config = $integration->connection_config ?? [];
        $provider = $integration->integration_type;

        $endpoint = match ($provider) {
            self::TMS_TRANSPOREON => ($config['api_url'] ?? 'https://api.transporeon.com') . '/v1/freight-offers',
            self::TMS_TIMOCOM => ($config['api_url'] ?? 'https://api.timocom.com') . '/freight-exchange/v1/offers',
            self::TMS_ALPEGA => ($config['api_url'] ?? 'https://api.alpegagroup.com') . '/v2/loads',
            default => ($config['api_url'] ?? '') . '/api/loads',
        };

        $queryParams = array_filter([
            'origin_country' => $filters['origin_country'] ?? null,
            'destination_country' => $filters['destination_country'] ?? null,
            'vehicle_type' => $filters['vehicle_type'] ?? null,
            'loading_date_from' => $filters['date_from'] ?? null,
            'loading_date_to' => $filters['date_to'] ?? null,
            'page' => $filters['page'] ?? 1,
            'limit' => $filters['limit'] ?? 50,
        ]);

        try {
            $response = Http::timeout(15)
                ->withHeaders($this->buildHeaders($integration))
                ->get($endpoint, $queryParams);

            if ($response->failed()) {
                return ['loads' => [], 'error' => "HTTP {$response->status()}"];
            }

            $raw = $response->json('data') ?? $response->json('results') ?? $response->json();

            return [
                'loads' => collect($raw)->map(fn($item) => $this->normalizeLoad($provider, $item))->toArray(),
                'total' => $response->json('total') ?? count($raw),
                'provider' => $provider,
            ];
        } catch (\Exception $e) {
            return ['loads' => [], 'error' => $e->getMessage()];
        }
    }

    /**
     * Send tracking update to a visibility platform.
     */
    public function pushTrackingUpdate(
        ErpIntegration $integration,
        string $shipmentRef,
        float $lat,
        float $lng,
        array $extras = []
    ): bool {
        $provider = $integration->integration_type;
        $config = $integration->connection_config ?? [];

        $payload = match ($provider) {
            self::TMS_SIXFOLD => [
                'shipment_reference' => $shipmentRef,
                'position' => ['latitude' => $lat, 'longitude' => $lng],
                'timestamp' => now()->toIso8601String(),
                'speed' => $extras['speed_kmh'] ?? null,
                'heading' => $extras['heading'] ?? null,
            ],
            self::TMS_PROJECT44 => [
                'trackingEvents' => [[
                    'shipmentIdentifiers' => [['type' => 'ORDER', 'value' => $shipmentRef]],
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'eventDateTime' => now()->toIso8601String(),
                    'speed' => $extras['speed_kmh'] ?? null,
                ]],
            ],
            self::TMS_FOURKITES => [
                'loads' => [[
                    'loadNumber' => $shipmentRef,
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'locatedAt' => now()->toIso8601String(),
                    'speedMph' => isset($extras['speed_kmh']) ? round($extras['speed_kmh'] * 0.621371, 1) : null,
                ]],
            ],
            default => [
                'reference' => $shipmentRef,
                'lat' => $lat,
                'lng' => $lng,
                'timestamp' => now()->toIso8601String(),
                ...$extras,
            ],
        };

        $endpoint = match ($provider) {
            self::TMS_SIXFOLD => ($config['api_url'] ?? 'https://api.sixfold.com') . '/v1/tracking',
            self::TMS_PROJECT44 => ($config['api_url'] ?? 'https://api.project44.com') . '/api/v4/tracking/events',
            self::TMS_FOURKITES => ($config['api_url'] ?? 'https://api.fourkites.com') . '/api/v2/loads/tracking',
            default => ($config['api_url'] ?? '') . '/api/tracking',
        };

        try {
            $response = Http::timeout(10)
                ->withHeaders($this->buildHeaders($integration))
                ->post($endpoint, $payload);

            return $response->successful();
        } catch (\Exception $e) {
            Log::warning("TMS tracking push failed [{$provider}]: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Import orders from a connected TMS into LogiMarket.
     */
    public function importOrders(ErpIntegration $integration, array $filters = []): array
    {
        $loads = $this->fetchAvailableLoads($integration, $filters);
        $imported = 0;
        $errors = [];

        foreach ($loads['loads'] ?? [] as $load) {
            try {
                FreightOffer::updateOrCreate(
                    ['external_reference' => $load['external_id'] ?? $load['reference']],
                    [
                        'company_id' => $integration->company_id,
                        'user_id' => $integration->company->users()->first()?->id,
                        'origin_country' => $load['origin_country'] ?? null,
                        'origin_city' => $load['origin_city'] ?? null,
                        'destination_country' => $load['destination_country'] ?? null,
                        'destination_city' => $load['destination_city'] ?? null,
                        'loading_date' => $load['loading_date'] ?? null,
                        'unloading_date' => $load['delivery_date'] ?? null,
                        'weight' => $load['weight_kg'] ?? null,
                        'vehicle_type' => $load['vehicle_type'] ?? null,
                        'price' => $load['price'] ?? null,
                        'currency' => $load['currency'] ?? 'EUR',
                        'status' => 'active',
                        'source' => "tms_{$integration->integration_type}",
                    ]
                );
                $imported++;
            } catch (\Exception $e) {
                $errors[] = $e->getMessage();
            }
        }

        return [
            'imported' => $imported,
            'total_available' => $loads['total'] ?? 0,
            'errors' => $errors,
            'provider' => $integration->integration_type,
        ];
    }

    // ─── Provider-specific formatting ───────────────────────────

    private function formatTransporeonFreight(FreightOffer $freight): array
    {
        return [
            'loadTender' => [
                'origin' => [
                    'country' => $freight->origin_country,
                    'city' => $freight->origin_city,
                    'postalCode' => $freight->origin_postal_code ?? null,
                ],
                'destination' => [
                    'country' => $freight->destination_country,
                    'city' => $freight->destination_city,
                    'postalCode' => $freight->destination_postal_code ?? null,
                ],
                'loadingWindow' => [
                    'from' => $freight->loading_date?->toIso8601String(),
                    'to' => $freight->loading_date_to?->toIso8601String(),
                ],
                'cargo' => [
                    'weight' => ['value' => $freight->weight, 'unit' => 'KG'],
                    'volume' => ['value' => $freight->volume, 'unit' => 'CBM'],
                    'palletCount' => $freight->pallet_count,
                    'description' => $freight->cargo_description,
                ],
                'vehicleRequirements' => ['type' => $freight->vehicle_type],
                'price' => ['value' => $freight->price, 'currency' => $freight->currency ?? 'EUR'],
                'reference' => $freight->id,
            ],
        ];
    }

    private function formatTimocomFreight(FreightOffer $freight): array
    {
        return [
            'type' => 'FREIGHT',
            'loading' => [
                'location' => [
                    'countryCode' => $freight->origin_country,
                    'city' => $freight->origin_city,
                ],
                'dateRange' => [
                    'from' => $freight->loading_date?->format('Y-m-d'),
                    'to' => $freight->loading_date_to?->format('Y-m-d') ?? $freight->loading_date?->format('Y-m-d'),
                ],
            ],
            'unloading' => [
                'location' => [
                    'countryCode' => $freight->destination_country,
                    'city' => $freight->destination_city,
                ],
            ],
            'cargo' => [
                'weight' => $freight->weight,
                'loadingMeters' => $freight->loading_meters ?? null,
                'description' => $freight->cargo_description,
            ],
            'vehicle' => ['type' => $freight->vehicle_type],
            'price' => $freight->price,
            'currency' => $freight->currency ?? 'EUR',
        ];
    }

    private function formatAlpegaFreight(FreightOffer $freight): array
    {
        return [
            'origin' => ['countryCode' => $freight->origin_country, 'city' => $freight->origin_city],
            'destination' => ['countryCode' => $freight->destination_country, 'city' => $freight->destination_city],
            'departureDate' => $freight->loading_date?->format('Y-m-d'),
            'weight' => $freight->weight,
            'vehicleType' => $freight->vehicle_type,
            'price' => $freight->price,
            'currency' => $freight->currency ?? 'EUR',
            'description' => $freight->cargo_description,
        ];
    }

    private function formatGenericFreight(FreightOffer $freight): array
    {
        return $freight->only([
            'origin_country', 'origin_city', 'destination_country', 'destination_city',
            'loading_date', 'unloading_date', 'weight', 'volume', 'pallet_count',
            'vehicle_type', 'cargo_description', 'price', 'currency',
        ]);
    }

    private function getPublishEndpoint(string $provider, array $config): string
    {
        return match ($provider) {
            self::TMS_TRANSPOREON => ($config['api_url'] ?? 'https://api.transporeon.com') . '/v1/load-tenders',
            self::TMS_TIMOCOM => ($config['api_url'] ?? 'https://api.timocom.com') . '/freight-exchange/v1/offers',
            self::TMS_ALPEGA => ($config['api_url'] ?? 'https://api.alpegagroup.com') . '/v2/loads',
            default => ($config['api_url'] ?? '') . '/api/freight',
        };
    }

    private function normalizeLoad(string $provider, array $raw): array
    {
        return match ($provider) {
            self::TMS_TRANSPOREON => [
                'external_id' => $raw['id'] ?? null,
                'reference' => $raw['reference'] ?? null,
                'origin_country' => data_get($raw, 'origin.country'),
                'origin_city' => data_get($raw, 'origin.city'),
                'destination_country' => data_get($raw, 'destination.country'),
                'destination_city' => data_get($raw, 'destination.city'),
                'loading_date' => data_get($raw, 'loadingWindow.from'),
                'delivery_date' => data_get($raw, 'deliveryWindow.to'),
                'weight_kg' => data_get($raw, 'cargo.weight.value'),
                'vehicle_type' => data_get($raw, 'vehicleRequirements.type'),
                'price' => data_get($raw, 'price.value'),
                'currency' => data_get($raw, 'price.currency', 'EUR'),
                'provider' => $provider,
            ],
            self::TMS_TIMOCOM => [
                'external_id' => $raw['id'] ?? null,
                'reference' => $raw['reference'] ?? null,
                'origin_country' => data_get($raw, 'loading.location.countryCode'),
                'origin_city' => data_get($raw, 'loading.location.city'),
                'destination_country' => data_get($raw, 'unloading.location.countryCode'),
                'destination_city' => data_get($raw, 'unloading.location.city'),
                'loading_date' => data_get($raw, 'loading.dateRange.from'),
                'delivery_date' => data_get($raw, 'unloading.dateRange.to'),
                'weight_kg' => data_get($raw, 'cargo.weight'),
                'vehicle_type' => data_get($raw, 'vehicle.type'),
                'price' => $raw['price'] ?? null,
                'currency' => $raw['currency'] ?? 'EUR',
                'provider' => $provider,
            ],
            default => [
                'external_id' => $raw['id'] ?? null,
                'reference' => $raw['reference'] ?? $raw['id'] ?? null,
                'origin_country' => $raw['origin_country'] ?? data_get($raw, 'origin.country'),
                'origin_city' => $raw['origin_city'] ?? data_get($raw, 'origin.city'),
                'destination_country' => $raw['destination_country'] ?? data_get($raw, 'destination.country'),
                'destination_city' => $raw['destination_city'] ?? data_get($raw, 'destination.city'),
                'loading_date' => $raw['loading_date'] ?? $raw['departure_date'] ?? null,
                'delivery_date' => $raw['delivery_date'] ?? $raw['arrival_date'] ?? null,
                'weight_kg' => $raw['weight'] ?? $raw['weight_kg'] ?? null,
                'vehicle_type' => $raw['vehicle_type'] ?? null,
                'price' => $raw['price'] ?? null,
                'currency' => $raw['currency'] ?? 'EUR',
                'provider' => $provider,
            ],
        };
    }

    private function buildHeaders(ErpIntegration $integration): array
    {
        $config = $integration->connection_config ?? [];

        $authType = $config['auth_type'] ?? 'api_key';
        $headers = ['Content-Type' => 'application/json', 'Accept' => 'application/json'];

        if ($authType === 'oauth2' && isset($config['access_token'])) {
            $headers['Authorization'] = 'Bearer ' . $config['access_token'];
        } elseif (isset($config['api_key'])) {
            $headers['Authorization'] = 'Bearer ' . $config['api_key'];
            $headers['X-API-Key'] = $config['api_key'];
        }

        return $headers;
    }
}
