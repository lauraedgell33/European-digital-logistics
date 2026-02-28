<?php

namespace App\Services;

use App\Models\DynamicPrice;
use App\Models\BarometerSnapshot;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;

class DynamicPricingService
{
    /**
     * Calculate dynamic price for a route.
     */
    public function calculatePrice(
        string $originCountry,
        string $destinationCountry,
        ?string $vehicleType = null,
        ?float $distanceKm = null,
        ?float $weightKg = null
    ): array {
        $basePrice = $this->getBasePrice($originCountry, $destinationCountry, $vehicleType);
        $demandIndex = $this->getDemandIndex($originCountry, $destinationCountry);
        $supplyIndex = $this->getSupplyIndex($originCountry, $destinationCountry);
        $fuelSurcharge = $this->getFuelSurcharge();
        $seasonalFactor = $this->getSeasonalFactor();
        $weatherFactor = 1.0; // Future: weather API integration

        $surgeMultiplier = max(0.8, min(2.0, ($demandIndex / max(0.1, $supplyIndex))));
        $dynamicPrice = round($basePrice * $surgeMultiplier * $seasonalFactor * $weatherFactor * (1 + $fuelSurcharge / 100), 4);

        $components = [
            'base_price' => $basePrice,
            'surge_multiplier' => round($surgeMultiplier, 2),
            'demand_index' => round($demandIndex, 2),
            'supply_index' => round($supplyIndex, 2),
            'fuel_surcharge_pct' => round($fuelSurcharge, 2),
            'seasonal_factor' => round($seasonalFactor, 2),
            'weather_factor' => round($weatherFactor, 2),
        ];

        $totalPrice = $distanceKm ? round($dynamicPrice * $distanceKm, 2) : null;
        $weightSurcharge = 0;
        if ($weightKg && $weightKg > 20000) {
            $weightSurcharge = round(($weightKg - 20000) * 0.002, 2);
            $totalPrice = $totalPrice ? $totalPrice + $weightSurcharge : null;
        }

        $result = DynamicPrice::create([
            'origin_country' => $originCountry,
            'origin_city' => null,
            'destination_country' => $destinationCountry,
            'destination_city' => null,
            'vehicle_type' => $vehicleType,
            'base_price_per_km' => $basePrice,
            'dynamic_price_per_km' => $dynamicPrice,
            'surge_multiplier' => $surgeMultiplier,
            'demand_index' => $demandIndex,
            'supply_index' => $supplyIndex,
            'fuel_surcharge_pct' => $fuelSurcharge,
            'seasonal_factor' => $seasonalFactor,
            'weather_factor' => $weatherFactor,
            'price_components' => $components,
            'valid_from' => now(),
            'valid_until' => now()->addHours(4),
            'currency' => 'EUR',
        ]);

        return [
            'price_per_km' => $dynamicPrice,
            'total_price' => $totalPrice,
            'weight_surcharge' => $weightSurcharge,
            'currency' => 'EUR',
            'components' => $components,
            'valid_until' => $result->valid_until->toIso8601String(),
            'market_status' => $surgeMultiplier > 1.3 ? 'high_demand' :
                ($surgeMultiplier < 0.9 ? 'low_demand' : 'normal'),
        ];
    }

    /**
     * Get price history for a route.
     */
    public function getPriceHistory(string $origin, string $destination, int $days = 30): array
    {
        $history = DynamicPrice::where('origin_country', $origin)
            ->where('destination_country', $destination)
            ->where('created_at', '>=', now()->subDays($days))
            ->orderBy('created_at')
            ->get()
            ->groupBy(fn($p) => $p->created_at->toDateString())
            ->map(fn($group) => [
                'date' => $group->first()->created_at->toDateString(),
                'avg_price' => round($group->avg('dynamic_price_per_km'), 4),
                'min_price' => round($group->min('dynamic_price_per_km'), 4),
                'max_price' => round($group->max('dynamic_price_per_km'), 4),
                'avg_surge' => round($group->avg('surge_multiplier'), 2),
            ]);

        return [
            'route' => "{$origin} → {$destination}",
            'days' => $days,
            'history' => $history->values(),
        ];
    }

    /**
     * Get current active prices for top routes.
     */
    public function getActivePrices(int $limit = 20): array
    {
        return DynamicPrice::active()
            ->orderByDesc('demand_index')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function getBasePrice(string $origin, string $destination, ?string $vehicleType): float
    {
        $snapshot = BarometerSnapshot::where('origin_country', $origin)
            ->where('destination_country', $destination)
            ->whereNotNull('avg_price_per_km')
            ->orderByDesc('snapshot_date')
            ->first();

        if ($snapshot) {
            return (float) $snapshot->avg_price_per_km;
        }

        $basePrices = [
            'curtainsider' => 1.10, 'box' => 1.15, 'flatbed' => 1.20,
            'refrigerated' => 1.45, 'tanker' => 1.50, 'container' => 1.30,
        ];

        return $basePrices[$vehicleType] ?? 1.15;
    }

    private function getDemandIndex(string $origin, string $destination): float
    {
        $freightCount = FreightOffer::where('origin_country', $origin)
            ->where('destination_country', $destination)
            ->where('status', 'active')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return max(0.5, min(3.0, $freightCount / 10));
    }

    private function getSupplyIndex(string $origin, string $destination): float
    {
        $vehicleCount = VehicleOffer::where('status', 'available')
            ->where(function ($q) use ($origin) {
                $q->where('current_country', $origin)
                    ->orWhereNull('current_country');
            })
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return max(0.5, min(3.0, $vehicleCount / 10));
    }

    private function getFuelSurcharge(): float
    {
        // Simulated diesel index — in production integrate with fuel price API
        return 12.5;
    }

    private function getSeasonalFactor(): float
    {
        $month = now()->month;
        $factors = [1 => 0.92, 2 => 0.94, 3 => 0.98, 4 => 1.0, 5 => 1.02, 6 => 1.05,
            7 => 0.95, 8 => 0.90, 9 => 1.08, 10 => 1.10, 11 => 1.03, 12 => 0.95];
        return $factors[$month] ?? 1.0;
    }
}
