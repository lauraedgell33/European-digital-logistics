<?php

namespace App\Services;

use App\Models\Shipment;
use App\Models\TrackingPosition;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * GPS Fleet Tracking integration — Samsara, Geotab, and generic GPS APIs.
 *
 * Pulls real-time vehicle positions, driving events, fuel data,
 * temperature readings, and HOS (hours of service) status.
 */
class GpsFleetTrackingService
{
    // ── Providers ───────────────────────────────────────────────
    public const PROVIDER_SAMSARA = 'samsara';
    public const PROVIDER_GEOTAB = 'geotab';
    public const PROVIDER_TELETRAC = 'teletrac_navman';
    public const PROVIDER_WEBFLEET = 'webfleet';  // Bridgestone / TomTom
    public const PROVIDER_GENERIC = 'generic_gps';

    /**
     * Get all supported GPS providers and their capabilities.
     */
    public function getSupportedProviders(): array
    {
        return [
            self::PROVIDER_SAMSARA => [
                'name' => 'Samsara',
                'capabilities' => ['location', 'speed', 'fuel', 'temperature', 'hos', 'diagnostics', 'driver_safety', 'geofence'],
                'auth' => 'api_key',
                'docs' => 'https://developers.samsara.com',
            ],
            self::PROVIDER_GEOTAB => [
                'name' => 'Geotab',
                'capabilities' => ['location', 'speed', 'fuel', 'temperature', 'hos', 'diagnostics', 'engine_data', 'zones'],
                'auth' => 'session',
                'docs' => 'https://developers.geotab.com',
            ],
            self::PROVIDER_TELETRAC => [
                'name' => 'Teletrac Navman',
                'capabilities' => ['location', 'speed', 'fuel', 'geofence', 'driver_behavior'],
                'auth' => 'api_key',
            ],
            self::PROVIDER_WEBFLEET => [
                'name' => 'Webfleet (Bridgestone)',
                'capabilities' => ['location', 'speed', 'fuel', 'navigation', 'messaging'],
                'auth' => 'api_key',
            ],
            self::PROVIDER_GENERIC => [
                'name' => 'Generic GPS API',
                'capabilities' => ['location', 'speed'],
                'auth' => 'api_key',
            ],
        ];
    }

    /**
     * Get real-time positions for all fleet vehicles.
     */
    public function getFleetPositions(string $provider, array $config): array
    {
        return match ($provider) {
            self::PROVIDER_SAMSARA => $this->getSamsaraPositions($config),
            self::PROVIDER_GEOTAB => $this->getGeotabPositions($config),
            default => $this->getGenericPositions($provider, $config),
        };
    }

    /**
     * Get position history for a specific vehicle.
     */
    public function getVehicleHistory(
        string $provider,
        array $config,
        string $vehicleId,
        string $from,
        string $to
    ): array {
        return match ($provider) {
            self::PROVIDER_SAMSARA => $this->getSamsaraHistory($config, $vehicleId, $from, $to),
            self::PROVIDER_GEOTAB => $this->getGeotabHistory($config, $vehicleId, $from, $to),
            default => [],
        };
    }

    /**
     * Get vehicle diagnostics (fuel, engine data, etc.).
     */
    public function getVehicleDiagnostics(string $provider, array $config, string $vehicleId): array
    {
        return match ($provider) {
            self::PROVIDER_SAMSARA => $this->getSamsaraDiagnostics($config, $vehicleId),
            self::PROVIDER_GEOTAB => $this->getGeotabDiagnostics($config, $vehicleId),
            default => ['error' => 'Diagnostics not supported for this provider'],
        };
    }

    /**
     * Get driver HOS (Hours of Service) status.
     */
    public function getDriverHos(string $provider, array $config, ?string $driverId = null): array
    {
        return match ($provider) {
            self::PROVIDER_SAMSARA => $this->getSamsaraHos($config, $driverId),
            self::PROVIDER_GEOTAB => $this->getGeotabHos($config, $driverId),
            default => ['error' => 'HOS not supported'],
        };
    }

    /**
     * Link a GPS device/vehicle to a LogiMarket shipment for live tracking.
     */
    public function linkToShipment(
        Shipment $shipment,
        string $provider,
        string $deviceId,
        array $config
    ): array {
        $shipment->update(['tracking_device_id' => $deviceId]);

        // Pull current position immediately
        $positions = $this->getFleetPositions($provider, $config);
        $vehiclePos = collect($positions['vehicles'] ?? [])
            ->firstWhere('device_id', $deviceId);

        if ($vehiclePos) {
            $shipment->updatePosition(
                $vehiclePos['lat'],
                $vehiclePos['lng'],
                array_filter([
                    'speed_kmh' => $vehiclePos['speed_kmh'] ?? null,
                    'heading' => $vehiclePos['heading'] ?? null,
                    'temperature' => $vehiclePos['temperature'] ?? null,
                ])
            );
        }

        return [
            'linked' => true,
            'shipment_id' => $shipment->id,
            'device_id' => $deviceId,
            'provider' => $provider,
            'current_position' => $vehiclePos,
        ];
    }

    /**
     * Sync GPS positions for all linked shipments. Called by scheduler.
     */
    public function syncAllLinkedShipments(string $provider, array $config): array
    {
        $positions = $this->getFleetPositions($provider, $config);
        $vehicleMap = collect($positions['vehicles'] ?? [])->keyBy('device_id');

        $linkedShipments = Shipment::whereNotNull('tracking_device_id')
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->get();

        $updated = 0;
        $errors = [];

        foreach ($linkedShipments as $shipment) {
            $pos = $vehicleMap->get($shipment->tracking_device_id);
            if (!$pos) continue;

            try {
                $shipment->updatePosition(
                    $pos['lat'],
                    $pos['lng'],
                    array_filter([
                        'speed_kmh' => $pos['speed_kmh'] ?? null,
                        'heading' => $pos['heading'] ?? null,
                        'temperature' => $pos['temperature'] ?? null,
                        'battery_level' => $pos['battery_level'] ?? null,
                    ])
                );
                $updated++;
            } catch (\Exception $e) {
                $errors[] = "Shipment #{$shipment->id}: {$e->getMessage()}";
            }
        }

        return [
            'updated' => $updated,
            'total_linked' => $linkedShipments->count(),
            'errors' => $errors,
            'provider' => $provider,
        ];
    }

    /**
     * Get geofence alerts for a fleet.
     */
    public function getGeofenceAlerts(string $provider, array $config): array
    {
        if ($provider === self::PROVIDER_SAMSARA) {
            return $this->samsaraRequest($config, 'GET', '/fleet/alerts', [
                'alert_type' => 'geofence',
                'startTime' => now()->subHours(24)->toIso8601String(),
            ]);
        }

        return ['alerts' => []];
    }

    // ─── Samsara API ────────────────────────────────────────────

    private function getSamsaraPositions(array $config): array
    {
        $data = $this->samsaraRequest($config, 'GET', '/fleet/vehicles/locations');

        return [
            'vehicles' => collect($data['data'] ?? [])->map(fn($v) => [
                'device_id' => $v['id'] ?? null,
                'name' => $v['name'] ?? null,
                'lat' => data_get($v, 'location.latitude'),
                'lng' => data_get($v, 'location.longitude'),
                'speed_kmh' => data_get($v, 'location.speed') ? round(data_get($v, 'location.speed') * 1.60934, 1) : null,
                'heading' => data_get($v, 'location.heading'),
                'timestamp' => data_get($v, 'location.time'),
                'engine_state' => data_get($v, 'engineState.value'),
                'fuel_pct' => data_get($v, 'fuelPercent.value'),
                'odometer_km' => data_get($v, 'odometerMeters.value') ? round(data_get($v, 'odometerMeters.value') / 1000, 1) : null,
                'provider' => self::PROVIDER_SAMSARA,
            ])->toArray(),
            'fetched_at' => now()->toIso8601String(),
        ];
    }

    private function getSamsaraHistory(array $config, string $vehicleId, string $from, string $to): array
    {
        $data = $this->samsaraRequest($config, 'GET', "/fleet/vehicles/{$vehicleId}/locations", [
            'startTime' => $from,
            'endTime' => $to,
        ]);

        return collect($data['data'] ?? [])->map(fn($p) => [
            'lat' => $p['latitude'] ?? null,
            'lng' => $p['longitude'] ?? null,
            'speed_kmh' => isset($p['speed']) ? round($p['speed'] * 1.60934, 1) : null,
            'heading' => $p['heading'] ?? null,
            'timestamp' => $p['time'] ?? null,
        ])->toArray();
    }

    private function getSamsaraDiagnostics(array $config, string $vehicleId): array
    {
        $data = $this->samsaraRequest($config, 'GET', "/fleet/vehicles/{$vehicleId}/stats", [
            'types' => 'engineStates,fuelPercents,obdOdometerMeters,gpsOdometerMeters,engineRpm',
        ]);

        $stats = $data['data'][0] ?? [];

        return [
            'vehicle_id' => $vehicleId,
            'engine_state' => data_get($stats, 'engineState.0.value'),
            'fuel_percent' => data_get($stats, 'fuelPercent.0.value'),
            'odometer_km' => data_get($stats, 'obdOdometerMeters.0.value')
                ? round(data_get($stats, 'obdOdometerMeters.0.value') / 1000, 1) : null,
            'engine_rpm' => data_get($stats, 'engineRpm.0.value'),
            'fetched_at' => now()->toIso8601String(),
        ];
    }

    private function getSamsaraHos(array $config, ?string $driverId): array
    {
        $params = $driverId ? ['driverIds' => $driverId] : [];
        $data = $this->samsaraRequest($config, 'GET', '/fleet/drivers/hos_daily_logs', $params);

        return collect($data['data'] ?? [])->map(fn($d) => [
            'driver_id' => $d['driverId'] ?? null,
            'driver_name' => $d['driverName'] ?? null,
            'driving_ms' => $d['activeMs'] ?? 0,
            'driving_hours' => round(($d['activeMs'] ?? 0) / 3600000, 2),
            'remaining_drive_ms' => $d['remainingDriveMs'] ?? null,
            'remaining_drive_hours' => isset($d['remainingDriveMs']) ? round($d['remainingDriveMs'] / 3600000, 2) : null,
            'status' => $d['currentDutyStatus'] ?? 'unknown',
            'last_status_change' => $d['lastStatusChangeTime'] ?? null,
            'violations' => $d['violations'] ?? [],
        ])->toArray();
    }

    private function samsaraRequest(array $config, string $method, string $path, array $params = []): array
    {
        $baseUrl = $config['api_url'] ?? 'https://api.samsara.com';
        $apiKey = $config['api_key'] ?? '';

        try {
            $request = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'Accept' => 'application/json',
                ]);

            $response = strtoupper($method) === 'GET'
                ? $request->get("{$baseUrl}{$path}", $params)
                : $request->post("{$baseUrl}{$path}", $params);

            if ($response->failed()) {
                Log::warning("Samsara API error: HTTP {$response->status()}", ['path' => $path]);
                return [];
            }

            return $response->json() ?? [];
        } catch (\Exception $e) {
            Log::error("Samsara API exception: {$e->getMessage()}", ['path' => $path]);
            return [];
        }
    }

    // ─── Geotab API ─────────────────────────────────────────────

    private function getGeotabPositions(array $config): array
    {
        $data = $this->geotabCall($config, 'Get', 'DeviceStatusInfo');

        return [
            'vehicles' => collect($data)->map(fn($v) => [
                'device_id' => $v['device']['id'] ?? null,
                'name' => $v['device']['name'] ?? null,
                'lat' => $v['latitude'] ?? null,
                'lng' => $v['longitude'] ?? null,
                'speed_kmh' => $v['speed'] ?? null,
                'heading' => $v['bearing'] ?? null,
                'timestamp' => $v['dateTime'] ?? null,
                'is_driving' => $v['isDriving'] ?? false,
                'current_state' => ($v['isDriving'] ?? false) ? 'driving' : 'stopped',
                'provider' => self::PROVIDER_GEOTAB,
            ])->toArray(),
            'fetched_at' => now()->toIso8601String(),
        ];
    }

    private function getGeotabHistory(array $config, string $deviceId, string $from, string $to): array
    {
        $data = $this->geotabCall($config, 'Get', 'LogRecord', [
            'search' => [
                'deviceSearch' => ['id' => $deviceId],
                'fromDate' => $from,
                'toDate' => $to,
            ],
        ]);

        return collect($data)->map(fn($p) => [
            'lat' => $p['latitude'] ?? null,
            'lng' => $p['longitude'] ?? null,
            'speed_kmh' => $p['speed'] ?? null,
            'timestamp' => $p['dateTime'] ?? null,
        ])->toArray();
    }

    private function getGeotabDiagnostics(array $config, string $deviceId): array
    {
        $data = $this->geotabCall($config, 'Get', 'StatusData', [
            'search' => [
                'deviceSearch' => ['id' => $deviceId],
                'fromDate' => now()->subHour()->toIso8601String(),
            ],
        ]);

        $latest = collect($data)->groupBy(fn($d) => $d['diagnostic']['id'] ?? 'unknown')
            ->map(fn($items) => $items->last());

        return [
            'vehicle_id' => $deviceId,
            'fuel_level' => data_get($latest, 'DiagnosticFuelLevelId.data'),
            'odometer_km' => data_get($latest, 'DiagnosticOdometerId.data'),
            'engine_hours' => data_get($latest, 'DiagnosticEngineHoursId.data'),
            'battery_voltage' => data_get($latest, 'DiagnosticBatteryVoltageId.data'),
            'coolant_temp' => data_get($latest, 'DiagnosticEngineCoolantTemperatureId.data'),
            'fetched_at' => now()->toIso8601String(),
        ];
    }

    private function getGeotabHos(array $config, ?string $driverId): array
    {
        $params = $driverId ? ['search' => ['userSearch' => ['id' => $driverId]]] : [];
        $data = $this->geotabCall($config, 'Get', 'DutyStatusAvailability', $params);

        return collect($data)->map(fn($d) => [
            'driver_id' => data_get($d, 'driver.id'),
            'driver_name' => data_get($d, 'driver.name'),
            'driving_hours' => data_get($d, 'driving.0.value', 0) / 3600,
            'remaining_drive_hours' => data_get($d, 'rest.0.value', 0) / 3600,
            'status' => data_get($d, 'dutyStatus') ?? 'unknown',
            'violations' => $d['violations'] ?? [],
        ])->toArray();
    }

    private function geotabCall(array $config, string $method, string $typeName, array $params = []): array
    {
        $server = $config['server'] ?? 'my.geotab.com';
        $database = $config['database'] ?? '';

        // Authenticate (session-based)
        $sessionId = Cache::remember(
            "geotab_session:{$database}",
            3300, // 55 min
            function () use ($config, $server, $database) {
                $resp = Http::post("https://{$server}/apiv1", [
                    'method' => 'Authenticate',
                    'params' => [
                        'database' => $database,
                        'userName' => $config['username'] ?? '',
                        'password' => $config['password'] ?? '',
                    ],
                ]);

                return $resp->json('result.credentials.sessionId');
            }
        );

        if (!$sessionId) {
            return [];
        }

        try {
            $response = Http::timeout(15)->post("https://{$server}/apiv1", [
                'method' => $method,
                'params' => array_merge($params, [
                    'typeName' => $typeName,
                    'credentials' => [
                        'database' => $database,
                        'sessionId' => $sessionId,
                    ],
                ]),
            ]);

            return $response->json('result') ?? [];
        } catch (\Exception $e) {
            Log::error("Geotab API error: {$e->getMessage()}");
            return [];
        }
    }

    // ─── Generic GPS API ────────────────────────────────────────

    private function getGenericPositions(string $provider, array $config): array
    {
        $baseUrl = $config['api_url'] ?? '';
        $apiKey = $config['api_key'] ?? '';

        if (!$baseUrl) return ['vehicles' => []];

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'Accept' => 'application/json',
                ])
                ->get("{$baseUrl}/api/vehicles/positions");

            if ($response->failed()) return ['vehicles' => []];

            $data = $response->json('data') ?? $response->json();

            return [
                'vehicles' => collect($data)->map(fn($v) => [
                    'device_id' => $v['device_id'] ?? $v['id'] ?? null,
                    'name' => $v['name'] ?? $v['vehicle_name'] ?? null,
                    'lat' => $v['lat'] ?? $v['latitude'] ?? null,
                    'lng' => $v['lng'] ?? $v['longitude'] ?? null,
                    'speed_kmh' => $v['speed_kmh'] ?? $v['speed'] ?? null,
                    'heading' => $v['heading'] ?? $v['bearing'] ?? null,
                    'timestamp' => $v['timestamp'] ?? $v['last_update'] ?? null,
                    'provider' => $provider,
                ])->toArray(),
                'fetched_at' => now()->toIso8601String(),
            ];
        } catch (\Exception $e) {
            return ['vehicles' => [], 'error' => $e->getMessage()];
        }
    }
}
