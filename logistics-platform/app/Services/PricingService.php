<?php

namespace App\Services;

class PricingService
{
    /**
     * Calculate suggested price for a freight shipment.
     */
    public function calculateSuggestedPrice(
        int $distanceKm,
        float $weightKg,
        string $vehicleType,
        array $options = []
    ): array {
        // Base rate per km depends on vehicle type
        $baseRates = [
            'standard_truck' => 1.10,
            'mega_trailer' => 1.15,
            'refrigerated' => 1.45,
            'tanker' => 1.50,
            'flatbed' => 1.20,
            'container' => 1.30,
            'curtainsider' => 1.12,
            'box_truck' => 1.05,
            'van' => 0.85,
        ];

        $baseRate = $baseRates[$vehicleType] ?? 1.15;

        // Weight surcharge
        $weightFactor = 1.0;
        if ($weightKg > 20000) $weightFactor = 1.15;
        elseif ($weightKg > 15000) $weightFactor = 1.10;
        elseif ($weightKg > 10000) $weightFactor = 1.05;

        // Hazardous goods surcharge
        $hazardousFactor = ($options['is_hazardous'] ?? false) ? 1.30 : 1.0;

        // Temperature controlled surcharge
        $tempFactor = ($options['temperature_controlled'] ?? false) ? 1.25 : 1.0;

        // Urgency factor
        $urgencyFactor = 1.0;
        if (isset($options['loading_date'])) {
            $daysUntilLoading = now()->diffInDays($options['loading_date'], false);
            if ($daysUntilLoading <= 1) $urgencyFactor = 1.30;
            elseif ($daysUntilLoading <= 3) $urgencyFactor = 1.15;
        }

        // Weekend/holiday surcharge
        $weekendFactor = 1.0;
        if (isset($options['loading_date'])) {
            $loadingDay = date('N', strtotime($options['loading_date']));
            if ($loadingDay >= 6) $weekendFactor = 1.15;
        }

        // Calculate price
        $price = $distanceKm * $baseRate * $weightFactor * $hazardousFactor
            * $tempFactor * $urgencyFactor * $weekendFactor;

        // Minimum price
        $price = max($price, 150);

        return [
            'suggested_price' => round($price, 2),
            'price_range' => [
                'low' => round($price * 0.85, 2),
                'high' => round($price * 1.15, 2),
            ],
            'breakdown' => [
                'base_cost' => round($distanceKm * $baseRate, 2),
                'weight_surcharge' => round($distanceKm * $baseRate * ($weightFactor - 1), 2),
                'hazardous_surcharge' => round($distanceKm * $baseRate * ($hazardousFactor - 1), 2),
                'temperature_surcharge' => round($distanceKm * $baseRate * ($tempFactor - 1), 2),
                'urgency_surcharge' => round($distanceKm * $baseRate * ($urgencyFactor - 1), 2),
                'weekend_surcharge' => round($distanceKm * $baseRate * ($weekendFactor - 1), 2),
            ],
            'price_per_km' => round($price / max($distanceKm, 1), 2),
            'currency' => 'EUR',
        ];
    }

    /**
     * Get market average prices for a route.
     */
    public function getMarketPrice(
        string $originCountry, string $destCountry,
        string $vehicleType, int $distanceKm
    ): array {
        // Query recent completed orders for similar routes
        $recentPrices = \App\Models\TransportOrder::where('status', 'completed')
            ->where('pickup_country', $originCountry)
            ->where('delivery_country', $destCountry)
            ->where('created_at', '>=', now()->subMonths(3))
            ->whereNotNull('total_price')
            ->pluck('total_price');

        if ($recentPrices->isEmpty()) {
            return $this->calculateSuggestedPrice($distanceKm, 10000, $vehicleType);
        }

        return [
            'market_average' => round($recentPrices->avg(), 2),
            'market_low' => round($recentPrices->min(), 2),
            'market_high' => round($recentPrices->max(), 2),
            'sample_size' => $recentPrices->count(),
            'currency' => 'EUR',
        ];
    }
}
