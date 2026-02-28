<?php

namespace App\Services;

use App\Models\MultimodalBooking;
use App\Models\IntermodalPlan;

class MultimodalService
{
    /**
     * Search available multimodal transport options.
     */
    public function searchOptions(array $params): array
    {
        $mode = $params['transport_mode'] ?? null;
        $origin = $params['origin_country'] ?? null;
        $destination = $params['destination_country'] ?? null;

        // Generate available options based on mode and route
        $options = [];

        if (!$mode || $mode === 'rail') {
            $options = array_merge($options, $this->getRailOptions($origin, $destination, $params));
        }
        if (!$mode || $mode === 'sea') {
            $options = array_merge($options, $this->getSeaOptions($origin, $destination, $params));
        }
        if (!$mode || $mode === 'air') {
            $options = array_merge($options, $this->getAirOptions($origin, $destination, $params));
        }
        if (!$mode || $mode === 'barge') {
            $options = array_merge($options, $this->getBargeOptions($origin, $destination, $params));
        }

        return [
            'options' => $options,
            'count' => count($options),
            'filters' => $params,
        ];
    }

    /**
     * Create an intermodal transport plan.
     */
    public function createIntermodalPlan(array $data, int $companyId, int $userId): IntermodalPlan
    {
        $origin = $data['origin'] ?? [];
        $destination = $data['destination'] ?? [];
        $priority = $data['optimization_priority'] ?? 'balanced';

        // Generate optimized legs
        $legs = $this->generateIntermodalLegs($origin, $destination, $priority, $data);

        $totalDistance = array_sum(array_column($legs, 'distance_km'));
        $totalDuration = array_sum(array_column($legs, 'duration_hours'));
        $totalCost = array_sum(array_column($legs, 'cost'));
        $totalCo2 = array_sum(array_column($legs, 'co2_kg'));

        // Road-only comparison
        $roadDistance = $totalDistance * 1.15; // Road is typically longer
        $roadCo2 = $roadDistance * 0.9; // 0.9 kg CO2/km for truck
        $roadCost = $roadDistance * 1.15; // €1.15/km average

        $plan = IntermodalPlan::create([
            'company_id' => $companyId,
            'user_id' => $userId,
            'transport_order_id' => $data['transport_order_id'] ?? null,
            'plan_reference' => 'IMP-' . strtoupper(substr(md5(uniqid()), 0, 8)),
            'origin_address' => $origin['address'] ?? '',
            'origin_country' => $origin['country'] ?? '',
            'origin_city' => $origin['city'] ?? '',
            'origin_lat' => $origin['lat'] ?? null,
            'origin_lng' => $origin['lng'] ?? null,
            'destination_address' => $destination['address'] ?? '',
            'destination_country' => $destination['country'] ?? '',
            'destination_city' => $destination['city'] ?? '',
            'destination_lat' => $destination['lat'] ?? null,
            'destination_lng' => $destination['lng'] ?? null,
            'legs' => $legs,
            'total_legs' => count($legs),
            'total_distance_km' => $totalDistance,
            'total_duration_hours' => $totalDuration,
            'total_cost' => $totalCost,
            'total_co2_kg' => $totalCo2,
            'currency' => 'EUR',
            'weight_kg' => $data['weight_kg'] ?? null,
            'volume_m3' => $data['volume_m3'] ?? null,
            'cargo_type' => $data['cargo_type'] ?? null,
            'road_only_cost' => round($roadCost, 2),
            'road_only_co2_kg' => round($roadCo2, 2),
            'cost_savings_pct' => $roadCost > 0 ? round((1 - $totalCost / $roadCost) * 100, 1) : 0,
            'co2_savings_pct' => $roadCo2 > 0 ? round((1 - $totalCo2 / $roadCo2) * 100, 1) : 0,
            'status' => 'ready',
            'optimization_priority' => $priority,
        ]);

        return $plan;
    }

    /**
     * Get intermodal statistics.
     */
    public function getStatistics(int $companyId): array
    {
        $plans = IntermodalPlan::where('company_id', $companyId);
        $bookings = MultimodalBooking::where('company_id', $companyId);

        return [
            'total_plans' => $plans->count(),
            'active_bookings' => $bookings->clone()->whereNotIn('status', ['cancelled', 'delivered'])->count(),
            'completed_bookings' => $bookings->clone()->where('status', 'delivered')->count(),
            'total_co2_saved_kg' => round($plans->sum('total_co2_kg') - $plans->sum('road_only_co2_kg'), 2),
            'total_cost_saved' => round($plans->sum('road_only_cost') - $plans->sum('total_cost'), 2),
            'by_mode' => MultimodalBooking::where('company_id', $companyId)
                ->selectRaw('transport_mode, COUNT(*) as count, SUM(price) as total_cost')
                ->groupBy('transport_mode')
                ->get(),
        ];
    }

    private function getRailOptions(string $origin, string $dest, array $params): array
    {
        $terminals = [
            'DE' => ['Hamburg Intermodal', 'Duisburg Terminal', 'München Riem'],
            'NL' => ['Rotterdam RSC', 'Amsterdam Terminal'],
            'PL' => ['Gdańsk DCT', 'Łódź Olechów'],
            'IT' => ['Milano Smistamento', 'Verona Q.E.'],
            'FR' => ['Paris Valenton', 'Lyon Vénissieux'],
            'ES' => ['Barcelona Can Tunis', 'Madrid Abroñigal'],
            'AT' => ['Wien Süd', 'Wels Terminal'],
            'CZ' => ['Praha Uhříněves', 'Ostrava Terminal'],
        ];

        $originTerminals = $terminals[$origin] ?? ["$origin Rail Terminal"];
        $destTerminals = $terminals[$dest] ?? ["$dest Rail Terminal"];

        return [
            [
                'mode' => 'rail',
                'carrier' => 'DB Cargo',
                'service' => 'Standard Intermodal',
                'origin_terminal' => $originTerminals[0],
                'destination_terminal' => $destTerminals[0],
                'departure' => now()->addDays(2)->toDateString(),
                'arrival' => now()->addDays(4)->toDateString(),
                'transit_hours' => 48,
                'price' => rand(800, 2500),
                'currency' => 'EUR',
                'co2_reduction_pct' => 75,
                'available_capacity' => rand(5, 20) . ' wagons',
            ],
        ];
    }

    private function getSeaOptions(string $origin, string $dest, array $params): array
    {
        return [
            [
                'mode' => 'sea',
                'carrier' => 'Maersk Line',
                'service' => 'Short Sea Shipping',
                'origin_terminal' => "$origin Port Terminal",
                'destination_terminal' => "$dest Port Terminal",
                'departure' => now()->addDays(3)->toDateString(),
                'arrival' => now()->addDays(8)->toDateString(),
                'transit_hours' => 120,
                'price' => rand(600, 3000),
                'currency' => 'EUR',
                'co2_reduction_pct' => 60,
                'container_types' => ['20ft', '40ft', '40ft_hc', 'reefer'],
            ],
        ];
    }

    private function getAirOptions(string $origin, string $dest, array $params): array
    {
        return [
            [
                'mode' => 'air',
                'carrier' => 'Lufthansa Cargo',
                'service' => 'Express Air Freight',
                'origin_terminal' => "$origin International Airport",
                'destination_terminal' => "$dest International Airport",
                'departure' => now()->addDays(1)->toDateString(),
                'arrival' => now()->addDays(1)->toDateString(),
                'transit_hours' => 6,
                'price' => rand(2000, 8000),
                'currency' => 'EUR',
                'max_weight_kg' => 5000,
                'co2_impact' => 'high',
            ],
        ];
    }

    private function getBargeOptions(string $origin, string $dest, array $params): array
    {
        return [
            [
                'mode' => 'barge',
                'carrier' => 'Rhine Barge Services',
                'service' => 'Inland Waterway',
                'origin_terminal' => "$origin River Terminal",
                'destination_terminal' => "$dest River Terminal",
                'departure' => now()->addDays(2)->toDateString(),
                'arrival' => now()->addDays(5)->toDateString(),
                'transit_hours' => 72,
                'price' => rand(400, 1500),
                'currency' => 'EUR',
                'co2_reduction_pct' => 80,
            ],
        ];
    }

    private function generateIntermodalLegs(array $origin, array $destination, string $priority, array $data): array
    {
        $distance = 800; // Default distance estimate
        $legs = [];

        // First mile: truck to terminal
        $legs[] = [
            'mode' => 'road',
            'from' => $origin['city'] ?? 'Origin',
            'to' => ($origin['city'] ?? 'Origin') . ' Terminal',
            'distance_km' => 50,
            'duration_hours' => 1.5,
            'cost' => 75,
            'co2_kg' => 45,
            'carrier' => 'Local Haulage',
        ];

        // Main haul based on priority
        $mainDistance = $distance - 100;
        if ($priority === 'co2') {
            $legs[] = [
                'mode' => 'rail',
                'from' => ($origin['city'] ?? 'Origin') . ' Terminal',
                'to' => ($destination['city'] ?? 'Dest') . ' Terminal',
                'distance_km' => $mainDistance,
                'duration_hours' => $mainDistance / 50,
                'cost' => round($mainDistance * 0.45, 2),
                'co2_kg' => round($mainDistance * 0.028, 2), // Rail: 0.028 kg/km
                'carrier' => 'DB Cargo Intermodal',
            ];
        } elseif ($priority === 'speed') {
            $legs[] = [
                'mode' => 'road',
                'from' => $origin['city'] ?? 'Origin',
                'to' => $destination['city'] ?? 'Dest',
                'distance_km' => $mainDistance,
                'duration_hours' => $mainDistance / 75,
                'cost' => round($mainDistance * 1.15, 2),
                'co2_kg' => round($mainDistance * 0.9, 2),
                'carrier' => 'Direct Truck',
            ];
        } else {
            $legs[] = [
                'mode' => 'rail',
                'from' => ($origin['city'] ?? 'Origin') . ' Terminal',
                'to' => ($destination['city'] ?? 'Dest') . ' Terminal',
                'distance_km' => $mainDistance,
                'duration_hours' => $mainDistance / 55,
                'cost' => round($mainDistance * 0.50, 2),
                'co2_kg' => round($mainDistance * 0.028, 2),
                'carrier' => 'Rail Cargo Europe',
            ];
        }

        // Last mile: terminal to destination
        $legs[] = [
            'mode' => 'road',
            'from' => ($destination['city'] ?? 'Dest') . ' Terminal',
            'to' => $destination['city'] ?? 'Destination',
            'distance_km' => 50,
            'duration_hours' => 1.5,
            'cost' => 75,
            'co2_kg' => 45,
            'carrier' => 'Local Delivery',
        ];

        return $legs;
    }
}
