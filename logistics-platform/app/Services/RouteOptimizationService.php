<?php

namespace App\Services;

use App\Models\RouteOptimization;
use Illuminate\Support\Facades\Log;

class RouteOptimizationService
{
    public function __construct(
        private readonly ExternalRoutingService $routingApi = new ExternalRoutingService()
    ) {}

    /**
     * Optimize a route with multiple waypoints — uses external mapping API when available.
     */
    public function optimize(array $waypoints, array $constraints = [], ?int $companyId = null, ?int $userId = null): RouteOptimization
    {
        $optimization = RouteOptimization::create([
            'company_id'        => $companyId,
            'user_id'           => $userId,
            'optimization_type' => count($waypoints) > 2 ? 'multi_stop' : 'single',
            'waypoints'         => $waypoints,
            'constraints'       => $constraints,
            'status'            => 'pending',
        ]);

        $result = $this->runOptimization($waypoints, $constraints);

        $optimization->update(array_merge($result, ['status' => 'completed']));

        return $optimization->fresh();
    }

    /**
     * Fleet optimization — multiple vehicles, multiple stops (CVRP approximation).
     */
    public function optimizeFleet(array $vehicles, array $stops, array $constraints = []): array
    {
        // Each vehicle has: {id, lat, lng, capacity_kg, max_stops}
        // Each stop has:    {id, lat, lng, weight_kg, time_window_start, time_window_end}

        $unassigned = $stops;
        $routes = [];

        foreach ($vehicles as $vehicle) {
            if (empty($unassigned)) break;

            $vehicleCap = $vehicle['capacity_kg'] ?? 24000;
            $maxStops   = $vehicle['max_stops'] ?? 20;
            $current    = ['lat' => $vehicle['lat'], 'lng' => $vehicle['lng']];
            $load       = 0;
            $assigned   = [];

            // Greedy nearest-neighbor assignment with capacity constraint
            while (count($assigned) < $maxStops && !empty($unassigned)) {
                $best     = null;
                $bestDist = PHP_FLOAT_MAX;
                $bestIdx  = 0;

                foreach ($unassigned as $idx => $stop) {
                    $stopWeight = $stop['weight_kg'] ?? 0;
                    if ($load + $stopWeight > $vehicleCap) continue;

                    $dist = $this->haversine($current['lat'], $current['lng'], $stop['lat'], $stop['lng']);
                    if ($dist < $bestDist) {
                        $bestDist = $dist;
                        $best     = $stop;
                        $bestIdx  = $idx;
                    }
                }

                if (!$best) break;

                $load += $best['weight_kg'] ?? 0;
                $assigned[] = $best;
                $current = ['lat' => $best['lat'], 'lng' => $best['lng']];
                unset($unassigned[$bestIdx]);
                $unassigned = array_values($unassigned);
            }

            if (!empty($assigned)) {
                // Get real road distances via external API
                $routeWaypoints = array_merge(
                    [['lat' => $vehicle['lat'], 'lng' => $vehicle['lng'], 'name' => 'Depot']],
                    $assigned
                );
                $directions = $this->routingApi->getDirections($routeWaypoints);

                $routes[] = [
                    'vehicle_id'      => $vehicle['id'] ?? null,
                    'stops'           => $assigned,
                    'total_weight_kg' => $load,
                    'utilization_pct' => round($load / max(1, $vehicleCap) * 100, 1),
                    'distance_km'     => $directions['distance_km'],
                    'duration_hours'  => $directions['duration_hours'],
                    'source'          => $directions['source'],
                ];
            }
        }

        return [
            'routes'            => $routes,
            'total_vehicles'    => count($routes),
            'unassigned_stops'  => $unassigned,
            'unassigned_count'  => count($unassigned),
        ];
    }

    private function runOptimization(array $waypoints, array $constraints): array
    {
        // ── TSP reorder for multi-stop ──
        $orderedWaypoints = count($waypoints) > 2
            ? $this->nearestNeighborTSP($waypoints)
            : $waypoints;

        // ── Get real road directions ──
        $directions = $this->routingApi->getDirections($orderedWaypoints, 'driving-hgv', $constraints);

        // ── Also calculate original (un-optimised) distance ──
        $originalDirections = count($waypoints) > 2
            ? $this->routingApi->getDirections($waypoints, 'driving-hgv', $constraints)
            : $directions;

        $originalDist = $originalDirections['distance_km'];
        $optimizedDist = $directions['distance_km'];
        $distanceSaved = max(0, $originalDist - $optimizedDist);
        $distanceSavedPct = $originalDist > 0 ? round(($distanceSaved / $originalDist) * 100, 1) : 0;

        $originalDuration  = $originalDirections['duration_hours'];
        $optimizedDuration = $directions['duration_hours'];

        // CO2: ~0.9 kg/km for HGV
        $co2PerKm  = 0.9;
        $co2Saved  = round($distanceSaved * $co2PerKm, 2);
        $costPerKm = 1.15;
        $costSaved = round($distanceSaved * $costPerKm, 2);

        // ── EU rest stops ──
        $restStops = $this->routingApi->calculateRestStops($optimizedDuration, $constraints);

        // ── Toll estimation ──
        $originCountry = $waypoints[0]['country'] ?? 'DE';
        $destCountry   = $waypoints[count($waypoints) - 1]['country'] ?? 'DE';
        $tolls = $this->routingApi->estimateTollCosts($optimizedDist, $originCountry, $destCountry);

        // ── Warnings ──
        $warnings = $directions['warnings'] ?? [];
        if (isset($constraints['max_driving_hours']) && $optimizedDuration > $constraints['max_driving_hours']) {
            $warnings[] = "Route exceeds max driving hours ({$constraints['max_driving_hours']}h). Rest stops are included.";
        }

        // ── Alternatives ──
        $alternatives = [
            [
                'name'           => 'Fastest Route (highway)',
                'distance_km'   => round($optimizedDist * 1.05, 2),
                'duration_hours' => round($optimizedDuration * 0.85, 2),
                'co2_kg'         => round($optimizedDist * 1.05 * $co2PerKm, 2),
                'priority'       => 'speed',
            ],
            [
                'name'           => 'Eco Route (lowest CO₂)',
                'distance_km'   => round($optimizedDist * 0.95, 2),
                'duration_hours' => round($optimizedDuration * 1.10, 2),
                'co2_kg'         => round($optimizedDist * 0.95 * $co2PerKm, 2),
                'priority'       => 'co2',
            ],
        ];

        return [
            'optimized_route'          => $orderedWaypoints,
            'original_distance_km'     => round($originalDist, 2),
            'optimized_distance_km'    => round($optimizedDist, 2),
            'distance_saved_km'        => round($distanceSaved, 2),
            'distance_saved_pct'       => $distanceSavedPct,
            'original_duration_hours'  => round($originalDuration, 2),
            'optimized_duration_hours' => round($optimizedDuration, 2),
            'time_saved_hours'         => round(max(0, $originalDuration - $optimizedDuration), 2),
            'estimated_co2_saved_kg'   => $co2Saved,
            'estimated_cost_saved_eur' => $costSaved,
            'toll_estimate'            => $tolls,
            'rest_stops'               => $restStops,
            'turn_by_turn'             => $directions['steps'] ?? [],
            'geometry'                 => $directions['geometry'] ?? null,
            'routing_source'           => $directions['source'] ?? 'haversine_fallback',
            'alternative_routes'       => $alternatives,
            'warnings'                 => $warnings,
        ];
    }

    private function nearestNeighborTSP(array $waypoints): array
    {
        if (count($waypoints) <= 2) return $waypoints;

        $start   = $waypoints[0];
        $end     = $waypoints[count($waypoints) - 1];
        $middle  = array_slice($waypoints, 1, -1);
        $visited = [$start];
        $current = $start;

        while (!empty($middle)) {
            $nearest     = null;
            $nearestDist = PHP_INT_MAX;
            $nearestIdx  = 0;

            foreach ($middle as $idx => $point) {
                $dist = $this->haversine($current['lat'] ?? 0, $current['lng'] ?? 0, $point['lat'] ?? 0, $point['lng'] ?? 0);
                if ($dist < $nearestDist) {
                    $nearestDist = $dist;
                    $nearest     = $point;
                    $nearestIdx  = $idx;
                }
            }

            $visited[] = $nearest;
            $current   = $nearest;
            unset($middle[$nearestIdx]);
            $middle = array_values($middle);
        }

        $visited[] = $end;
        return $visited;
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
