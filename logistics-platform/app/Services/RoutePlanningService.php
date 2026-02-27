<?php

namespace App\Services;

use App\Models\Route;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class RoutePlanningService
{
    private const FUEL_PRICE_PER_LITER = 1.55; // EUR average
    private const FUEL_CONSUMPTION_PER_KM = 0.30; // liters (truck average)

    /**
     * Calculate route between two points.
     */
    public function calculateRoute(
        string $originCountry, string $originCity,
        string $destCountry, string $destCity,
        float $originLat = null, float $originLng = null,
        float $destLat = null, float $destLng = null
    ): array {
        $cacheKey = "route:{$originCountry}:{$originCity}:{$destCountry}:{$destCity}";

        return Cache::remember($cacheKey, 86400, function () use (
            $originCountry, $originCity, $destCountry, $destCity,
            $originLat, $originLng, $destLat, $destLng
        ) {
            // Try Google Maps API first
            $apiKey = config('services.google_maps.key');

            if ($apiKey && $originLat && $originLng && $destLat && $destLng) {
                return $this->calculateWithGoogleMaps(
                    $originLat, $originLng, $destLat, $destLng, $apiKey
                );
            }

            // Fallback to Haversine estimation
            return $this->estimateRoute(
                $originCountry, $originCity, $destCountry, $destCity,
                $originLat, $originLng, $destLat, $destLng
            );
        });
    }

    /**
     * Calculate route using Google Maps Directions API.
     */
    private function calculateWithGoogleMaps(
        float $originLat, float $originLng,
        float $destLat, float $destLng,
        string $apiKey
    ): array {
        try {
            $response = Http::get('https://maps.googleapis.com/maps/api/directions/json', [
                'origin' => "{$originLat},{$originLng}",
                'destination' => "{$destLat},{$destLng}",
                'key' => $apiKey,
                'mode' => 'driving',
                'avoid' => 'ferries',
            ]);

            $data = $response->json();

            if ($data['status'] === 'OK' && !empty($data['routes'])) {
                $route = $data['routes'][0];
                $leg = $route['legs'][0];
                $distanceKm = round($leg['distance']['value'] / 1000);
                $durationMin = round($leg['duration']['value'] / 60);

                return [
                    'distance_km' => $distanceKm,
                    'duration_minutes' => $durationMin,
                    'fuel_cost' => $this->calculateFuelCost($distanceKm),
                    'toll_costs' => $this->estimateTolls($distanceKm),
                    'total_cost' => $this->calculateTotalCost($distanceKm),
                    'polyline' => $route['overview_polyline']['points'] ?? null,
                    'source' => 'google_maps',
                ];
            }
        } catch (\Exception $e) {
            // Fall through to estimation
        }

        return $this->estimateRoute(null, null, null, null, $originLat, $originLng, $destLat, $destLng);
    }

    /**
     * Estimate route using Haversine distance with road factor.
     */
    private function estimateRoute(
        ?string $originCountry, ?string $originCity,
        ?string $destCountry, ?string $destCity,
        ?float $originLat, ?float $originLng,
        ?float $destLat, ?float $destLng
    ): array {
        if ($originLat && $originLng && $destLat && $destLng) {
            $trackingService = new TrackingService();
            $straightDistance = $trackingService->calculateDistance(
                $originLat, $originLng, $destLat, $destLng
            );
        } else {
            // Use a rough estimate
            $straightDistance = 500;
        }

        // Road factor: actual road distance is typically 1.3-1.4x straight line
        $roadFactor = 1.35;
        $distanceKm = round($straightDistance * $roadFactor);

        // Average truck speed: 65 km/h including breaks
        $durationMinutes = round(($distanceKm / 65) * 60);

        return [
            'distance_km' => $distanceKm,
            'duration_minutes' => $durationMinutes,
            'fuel_cost' => $this->calculateFuelCost($distanceKm),
            'toll_costs' => $this->estimateTolls($distanceKm, $originCountry, $destCountry),
            'total_cost' => $this->calculateTotalCost($distanceKm),
            'source' => 'estimation',
        ];
    }

    /**
     * Calculate fuel cost.
     */
    public function calculateFuelCost(int $distanceKm): float
    {
        return round($distanceKm * self::FUEL_CONSUMPTION_PER_KM * self::FUEL_PRICE_PER_LITER, 2);
    }

    /**
     * Estimate toll costs by country.
     */
    private function estimateTolls(int $distanceKm, ?string $fromCountry = null, ?string $toCountry = null): array
    {
        // Average toll costs per km by country (EUR)
        $tollRates = [
            'DE' => 0.19, // Germany Maut
            'FR' => 0.15, // France
            'IT' => 0.12, // Italy
            'ES' => 0.11, // Spain
            'AT' => 0.17, // Austria
            'PL' => 0.08, // Poland
            'CZ' => 0.10, // Czech Republic
            'HU' => 0.09, // Hungary
            'BE' => 0.13, // Belgium
            'NL' => 0.05, // Netherlands
            'RO' => 0.06, // Romania
            'BG' => 0.05, // Bulgaria
        ];

        $tolls = [];

        if ($fromCountry && isset($tollRates[$fromCountry])) {
            $countryKm = min($distanceKm * 0.4, $distanceKm);
            $tolls[] = [
                'country' => $fromCountry,
                'cost' => round($countryKm * $tollRates[$fromCountry], 2),
            ];
        }

        if ($toCountry && $toCountry !== $fromCountry && isset($tollRates[$toCountry])) {
            $countryKm = min($distanceKm * 0.4, $distanceKm);
            $tolls[] = [
                'country' => $toCountry,
                'cost' => round($countryKm * $tollRates[$toCountry], 2),
            ];
        }

        return $tolls;
    }

    /**
     * Calculate total transport cost estimate.
     */
    public function calculateTotalCost(int $distanceKm, array $options = []): float
    {
        $fuelCost = $this->calculateFuelCost($distanceKm);

        // Driver cost: avg EUR 23/hour
        $driverHours = $distanceKm / 65; // avg speed
        $driverCost = $driverHours * 23;

        // Fixed costs (per trip): insurance, vehicle depreciation, etc.
        $fixedCosts = 50;

        // Estimated tolls
        $tollCost = $distanceKm * 0.10; // average

        return round($fuelCost + $driverCost + $fixedCosts + $tollCost, 2);
    }

    /**
     * Save a calculated route to the database.
     */
    public function saveRoute(array $routeData): Route
    {
        return Route::updateOrCreate(
            [
                'origin_country' => $routeData['origin_country'],
                'origin_city' => $routeData['origin_city'],
                'destination_country' => $routeData['destination_country'],
                'destination_city' => $routeData['destination_city'],
            ],
            $routeData
        );
    }
}
