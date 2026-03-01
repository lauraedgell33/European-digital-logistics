<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * External mapping API integration — OpenRouteService (ORS).
 * Provides real road distances/durations, geocoding, isochrones.
 * Falls back to Haversine when API is unavailable.
 */
class ExternalRoutingService
{
    private string $baseUrl;
    private ?string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.openrouteservice.url', 'https://api.openrouteservice.org');
        $this->apiKey  = config('services.openrouteservice.key');
    }

    /**
     * Get road-based directions between waypoints.
     *
     * @param  array  $waypoints  [['lat' => ..., 'lng' => ...], ...]
     * @param  string $profile    driving-hgv | driving-car
     * @return array  {distance_km, duration_hours, geometry, steps, warnings}
     */
    public function getDirections(array $waypoints, string $profile = 'driving-hgv', array $options = []): array
    {
        if (!$this->apiKey) {
            return $this->fallbackDirections($waypoints);
        }

        $coordinates = array_map(fn ($wp) => [$wp['lng'], $wp['lat']], $waypoints);

        $cacheKey = 'ors:dir:' . md5(json_encode([$coordinates, $profile, $options]));

        return Cache::remember($cacheKey, 1800, function () use ($coordinates, $profile, $options) {
            try {
                $body = [
                    'coordinates' => $coordinates,
                    'instructions' => true,
                    'units'        => 'km',
                    'language'     => 'en',
                ];

                if ($profile === 'driving-hgv') {
                    $body['vehicle_type'] = $options['vehicle_type'] ?? 'hgv';
                    if (isset($options['weight_tons'])) {
                        $body['options'] = ['vehicle_type' => 'hgv'];
                        $body['options']['profile_params'] = [
                            'restrictions' => ['weight' => $options['weight_tons']],
                        ];
                    }
                }

                if (!empty($options['avoid'])) {
                    $body['options']['avoid_features'] = $options['avoid'];
                }

                $response = Http::timeout(15)
                    ->withHeaders([
                        'Authorization' => $this->apiKey,
                        'Content-Type'  => 'application/json',
                    ])
                    ->post("{$this->baseUrl}/v2/directions/{$profile}/json", $body);

                if ($response->failed()) {
                    Log::warning('ORS directions failed', ['status' => $response->status()]);
                    return $this->fallbackDirections(
                        array_map(fn ($c) => ['lat' => $c[1], 'lng' => $c[0]], $coordinates)
                    );
                }

                $data  = $response->json();
                $route = $data['routes'][0] ?? null;

                if (!$route) {
                    return $this->fallbackDirections(
                        array_map(fn ($c) => ['lat' => $c[1], 'lng' => $c[0]], $coordinates)
                    );
                }

                $distanceKm   = round($route['summary']['distance'] / 1000, 2);
                $durationHours = round($route['summary']['duration'] / 3600, 2);

                $steps = collect($route['segments'] ?? [])
                    ->flatMap(fn ($seg) => $seg['steps'] ?? [])
                    ->map(fn ($step) => [
                        'instruction' => $step['instruction'] ?? '',
                        'distance_km' => round(($step['distance'] ?? 0) / 1000, 2),
                        'duration_min' => round(($step['duration'] ?? 0) / 60, 1),
                        'type'        => $step['type'] ?? null,
                    ])->values()->toArray();

                $warnings = [];
                if (isset($route['warnings'])) {
                    $warnings = array_map(fn ($w) => $w['message'] ?? $w, $route['warnings']);
                }

                return [
                    'distance_km'    => $distanceKm,
                    'duration_hours' => $durationHours,
                    'geometry'       => $route['geometry'] ?? null,
                    'steps'          => $steps,
                    'warnings'       => $warnings,
                    'source'         => 'openrouteservice',
                    'bbox'           => $route['bbox'] ?? null,
                ];
            } catch (\Exception $e) {
                Log::error('ORS directions error', ['error' => $e->getMessage()]);
                return $this->fallbackDirections(
                    array_map(fn ($c) => ['lat' => $c[1], 'lng' => $c[0]], $coordinates)
                );
            }
        });
    }

    /**
     * Get distance/duration matrix between multiple points.
     */
    public function getMatrix(array $origins, array $destinations, string $profile = 'driving-hgv'): array
    {
        if (!$this->apiKey) {
            return $this->fallbackMatrix($origins, $destinations);
        }

        $locations = array_merge(
            array_map(fn ($o) => [$o['lng'], $o['lat']], $origins),
            array_map(fn ($d) => [$d['lng'], $d['lat']], $destinations)
        );

        $srcIndices = range(0, count($origins) - 1);
        $dstIndices = range(count($origins), count($origins) + count($destinations) - 1);

        try {
            $response = Http::timeout(20)
                ->withHeaders([
                    'Authorization' => $this->apiKey,
                    'Content-Type'  => 'application/json',
                ])
                ->post("{$this->baseUrl}/v2/matrix/{$profile}/json", [
                    'locations'    => $locations,
                    'sources'      => $srcIndices,
                    'destinations' => $dstIndices,
                    'metrics'      => ['distance', 'duration'],
                    'units'        => 'km',
                ]);

            if ($response->failed()) {
                return $this->fallbackMatrix($origins, $destinations);
            }

            $data = $response->json();

            return [
                'distances'  => $data['distances'] ?? [],
                'durations'  => $data['durations'] ?? [],
                'source'     => 'openrouteservice',
            ];
        } catch (\Exception $e) {
            Log::error('ORS matrix error', ['error' => $e->getMessage()]);
            return $this->fallbackMatrix($origins, $destinations);
        }
    }

    /**
     * Geocode an address → lat/lng.
     */
    public function geocode(string $query, string $countryCode = null): ?array
    {
        if (!$this->apiKey) return null;

        $cacheKey = 'ors:geo:' . md5($query . $countryCode);

        return Cache::remember($cacheKey, 86400, function () use ($query, $countryCode) {
            try {
                $params = [
                    'api_key' => $this->apiKey,
                    'text'    => $query,
                    'size'    => 1,
                ];
                if ($countryCode) {
                    $params['boundary.country'] = strtoupper($countryCode);
                }

                $response = Http::timeout(10)->get("{$this->baseUrl}/geocode/search", $params);

                if ($response->failed()) return null;

                $features = $response->json('features', []);
                if (empty($features)) return null;

                $coords = $features[0]['geometry']['coordinates'] ?? null;
                $props  = $features[0]['properties'] ?? [];

                return $coords ? [
                    'lat'     => $coords[1],
                    'lng'     => $coords[0],
                    'label'   => $props['label'] ?? $query,
                    'country' => $props['country_a'] ?? null,
                    'city'    => $props['locality'] ?? $props['name'] ?? null,
                ] : null;
            } catch (\Exception $e) {
                return null;
            }
        });
    }

    /**
     * Estimate toll costs for EU routes.
     */
    public function estimateTollCosts(float $distanceKm, string $originCountry, string $destCountry, string $vehicleType = 'hgv'): array
    {
        // EU toll rates per km (approximate, heavy goods vehicles)
        $tollRates = [
            'DE' => 0.187, 'AT' => 0.213, 'CZ' => 0.120, 'PL' => 0.090,
            'HU' => 0.115, 'SK' => 0.098, 'SI' => 0.170, 'HR' => 0.095,
            'IT' => 0.145, 'FR' => 0.200, 'ES' => 0.110, 'PT' => 0.085,
            'BE' => 0.132, 'NL' => 0.000, 'BG' => 0.070, 'RO' => 0.055,
            'SE' => 0.075, 'DK' => 0.065, 'FI' => 0.000, 'LT' => 0.045,
            'LV' => 0.040, 'EE' => 0.035, 'IE' => 0.050, 'LU' => 0.000,
            'GR' => 0.065, 'CH' => 0.250, 'NO' => 0.150, 'GB' => 0.000,
        ];

        // Assume half the distance is in origin country, half in destination
        $originRate = $tollRates[strtoupper($originCountry)] ?? 0.10;
        $destRate   = $tollRates[strtoupper($destCountry)] ?? 0.10;
        $avgRate    = ($originRate + $destRate) / 2;

        // 70% of distance is on tolled roads (estimate)
        $tolledKm = $distanceKm * 0.70;
        $totalToll = round($tolledKm * $avgRate, 2);

        return [
            'estimated_toll_eur' => $totalToll,
            'toll_per_km'        => round($avgRate, 4),
            'tolled_distance_km' => round($tolledKm, 1),
            'origin_rate'        => $originRate,
            'destination_rate'   => $destRate,
            'currency'           => 'EUR',
            'note'               => 'Estimated based on EU average HGV toll rates',
        ];
    }

    /**
     * Calculate required rest stops per EU Regulation EC 561/2006.
     */
    public function calculateRestStops(float $durationHours, array $constraints = []): array
    {
        $maxDriving = $constraints['max_driving_hours'] ?? 9;   // EU: 9h/day (10h max twice/week)
        $breakAfter = $constraints['break_after_hours'] ?? 4.5; // EU: 45min break after 4.5h
        $dailyRest  = $constraints['daily_rest_hours'] ?? 11;   // EU: 11h daily rest (9h reduced 3x/week)
        $weeklyMax  = $constraints['weekly_max_hours'] ?? 56;   // EU: 56h/week max

        $totalDrivingLeft = $durationHours;
        $stops = [];
        $currentDriving = 0;
        $dayDriving = 0;
        $dayCount = 1;

        while ($totalDrivingLeft > 0) {
            $driveNow = min($breakAfter, $totalDrivingLeft, $maxDriving - $dayDriving);
            $currentDriving += $driveNow;
            $dayDriving += $driveNow;
            $totalDrivingLeft -= $driveNow;

            if ($totalDrivingLeft <= 0) break;

            if ($dayDriving >= $maxDriving) {
                // Daily rest required
                $stops[] = [
                    'type'           => 'daily_rest',
                    'after_hours'    => round($currentDriving, 1),
                    'duration_hours' => $dailyRest,
                    'regulation'     => 'EC 561/2006 Art. 8',
                    'day'            => $dayCount,
                ];
                $dayCount++;
                $dayDriving = 0;
            } else {
                // 45-min break
                $stops[] = [
                    'type'           => 'break',
                    'after_hours'    => round($currentDriving, 1),
                    'duration_hours' => 0.75,
                    'regulation'     => 'EC 561/2006 Art. 7',
                    'day'            => $dayCount,
                ];
            }
        }

        $totalRestHours = collect($stops)->sum('duration_hours');
        $totalTripHours = $durationHours + $totalRestHours;

        return [
            'driving_hours'    => round($durationHours, 1),
            'total_rest_hours' => round($totalRestHours, 1),
            'total_trip_hours' => round($totalTripHours, 1),
            'driving_days'     => $dayCount,
            'stops'            => $stops,
            'compliant'        => true,
            'regulation'       => 'EC 561/2006 — EU driving & rest time rules',
        ];
    }

    // ── Fallbacks ──

    private function fallbackDirections(array $waypoints): array
    {
        $totalDist = 0;
        for ($i = 0; $i < count($waypoints) - 1; $i++) {
            $totalDist += $this->haversine(
                $waypoints[$i]['lat'], $waypoints[$i]['lng'],
                $waypoints[$i + 1]['lat'], $waypoints[$i + 1]['lng']
            );
        }
        $roadFactor = 1.3;
        $distanceKm = round($totalDist * $roadFactor, 2);

        return [
            'distance_km'    => $distanceKm,
            'duration_hours' => round($distanceKm / 70, 2),
            'geometry'       => null,
            'steps'          => [],
            'warnings'       => ['Using straight-line estimate — no routing API key configured'],
            'source'         => 'haversine_fallback',
        ];
    }

    private function fallbackMatrix(array $origins, array $destinations): array
    {
        $distances = [];
        $durations = [];
        foreach ($origins as $o) {
            $row_d = [];
            $row_t = [];
            foreach ($destinations as $d) {
                $dist = $this->haversine($o['lat'], $o['lng'], $d['lat'], $d['lng']) * 1.3;
                $row_d[] = round($dist, 2);
                $row_t[] = round($dist / 70 * 3600, 0);
            }
            $distances[] = $row_d;
            $durations[] = $row_t;
        }

        return ['distances' => $distances, 'durations' => $durations, 'source' => 'haversine_fallback'];
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return round($earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a)), 2);
    }
}
