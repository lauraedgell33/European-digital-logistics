<?php

namespace App\Services;

use App\Models\AiPrediction;
use App\Models\FreightOffer;
use App\Models\BarometerSnapshot;
use Illuminate\Support\Collection;

class PredictiveAnalyticsService
{
    /**
     * Generate demand predictions for a route.
     */
    public function predictDemand(string $origin, string $destination, int $daysAhead = 30): array
    {
        $historical = BarometerSnapshot::where('origin_country', $origin)
            ->where('destination_country', $destination)
            ->where('snapshot_date', '>=', now()->subMonths(6))
            ->orderBy('snapshot_date')
            ->get();

        $predictions = [];
        for ($i = 1; $i <= $daysAhead; $i++) {
            $targetDate = now()->addDays($i);
            $dayOfWeek = $targetDate->dayOfWeek;
            $month = $targetDate->month;

            // Simple seasonal + day-of-week model
            $baseValue = $historical->avg('freight_offers_count') ?? 50;
            $seasonalFactor = $this->getSeasonalFactor($month);
            $dayFactor = $this->getDayOfWeekFactor($dayOfWeek);
            $trend = $this->calculateTrend($historical->pluck('freight_offers_count')->toArray());

            $predicted = round($baseValue * $seasonalFactor * $dayFactor + $trend * $i, 2);
            $confidence = min(95, max(40, 85 - ($i * 1.5)));
            $margin = $predicted * (1 - $confidence / 100);

            $prediction = AiPrediction::updateOrCreate(
                [
                    'prediction_type' => 'demand',
                    'origin_country' => $origin,
                    'destination_country' => $destination,
                    'target_date' => $targetDate->toDateString(),
                ],
                [
                    'prediction_date' => now()->toDateString(),
                    'predicted_value' => $predicted,
                    'confidence' => $confidence,
                    'lower_bound' => max(0, $predicted - $margin),
                    'upper_bound' => $predicted + $margin,
                    'model_version' => 'v1.0',
                    'features_used' => ['seasonal', 'day_of_week', 'trend', 'historical_avg'],
                ]
            );

            $predictions[] = $prediction;
        }

        return [
            'route' => "{$origin} → {$destination}",
            'predictions' => $predictions,
            'model' => 'v1.0',
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Generate price forecast for a route.
     */
    public function predictPricing(string $origin, string $destination, int $daysAhead = 14): array
    {
        $historical = BarometerSnapshot::where('origin_country', $origin)
            ->where('destination_country', $destination)
            ->whereNotNull('avg_price_per_km')
            ->orderByDesc('snapshot_date')
            ->limit(90)
            ->get();

        $avgPrice = $historical->avg('avg_price_per_km') ?? 1.20;
        $predictions = [];

        for ($i = 1; $i <= $daysAhead; $i++) {
            $targetDate = now()->addDays($i);
            $seasonalFactor = $this->getSeasonalFactor($targetDate->month);
            $dayFactor = $this->getDayOfWeekFactor($targetDate->dayOfWeek);
            $volatility = 0.05 + ($i * 0.003);

            $predicted = round($avgPrice * $seasonalFactor * $dayFactor, 4);
            $confidence = min(92, max(35, 88 - ($i * 2)));

            $prediction = AiPrediction::updateOrCreate(
                [
                    'prediction_type' => 'pricing',
                    'origin_country' => $origin,
                    'destination_country' => $destination,
                    'target_date' => $targetDate->toDateString(),
                ],
                [
                    'prediction_date' => now()->toDateString(),
                    'predicted_value' => $predicted,
                    'confidence' => $confidence,
                    'lower_bound' => round($predicted * (1 - $volatility), 4),
                    'upper_bound' => round($predicted * (1 + $volatility), 4),
                    'model_version' => 'v1.0',
                    'features_used' => ['seasonal', 'day_of_week', 'historical_avg', 'volatility'],
                ]
            );

            $predictions[] = $prediction;
        }

        return [
            'route' => "{$origin} → {$destination}",
            'currency' => 'EUR',
            'unit' => 'per_km',
            'predictions' => $predictions,
        ];
    }

    /**
     * Capacity forecast.
     */
    public function predictCapacity(string $origin, string $destination): array
    {
        $recent = BarometerSnapshot::where('origin_country', $origin)
            ->where('destination_country', $destination)
            ->orderByDesc('snapshot_date')
            ->limit(30)
            ->get();

        $avgRatio = $recent->avg('freight_to_vehicle_ratio') ?? 1.0;
        $avgVehicles = $recent->avg('vehicle_offers_count') ?? 30;

        return [
            'current_ratio' => round($avgRatio, 2),
            'avg_available_vehicles' => round($avgVehicles),
            'market_status' => $avgRatio > 1.5 ? 'tight' : ($avgRatio > 1.0 ? 'balanced' : 'oversupply'),
            'recommendation' => $avgRatio > 1.5
                ? 'High demand — consider booking early or increasing pricing'
                : ($avgRatio > 1.0
                    ? 'Balanced market — standard pricing applies'
                    : 'Oversupply — opportunity for better rates'),
        ];
    }

    /**
     * Market analytics overview.
     */
    public function getMarketAnalytics(): array
    {
        $topRoutes = BarometerSnapshot::select('origin_country', 'destination_country')
            ->selectRaw('AVG(freight_offers_count) as avg_demand')
            ->selectRaw('AVG(avg_price_per_km) as avg_price')
            ->selectRaw('AVG(freight_to_vehicle_ratio) as avg_ratio')
            ->where('snapshot_date', '>=', now()->subDays(30))
            ->groupBy('origin_country', 'destination_country')
            ->orderByDesc('avg_demand')
            ->limit(20)
            ->get();

        $recentPredictions = AiPrediction::where('prediction_date', '>=', now()->subDays(7))
            ->whereNotNull('actual_value')
            ->get();

        $accuracy = $recentPredictions->count() > 0
            ? round($recentPredictions->avg('accuracy_pct'), 1)
            : null;

        return [
            'top_routes' => $topRoutes,
            'model_accuracy' => $accuracy,
            'predictions_count' => AiPrediction::where('prediction_date', '>=', now()->subDays(30))->count(),
            'generated_at' => now()->toIso8601String(),
        ];
    }

    private function getSeasonalFactor(int $month): float
    {
        $factors = [1 => 0.85, 2 => 0.88, 3 => 0.95, 4 => 1.0, 5 => 1.05, 6 => 1.08,
            7 => 0.92, 8 => 0.85, 9 => 1.1, 10 => 1.12, 11 => 1.05, 12 => 0.90];
        return $factors[$month] ?? 1.0;
    }

    private function getDayOfWeekFactor(int $dayOfWeek): float
    {
        $factors = [0 => 0.4, 1 => 1.15, 2 => 1.1, 3 => 1.05, 4 => 1.0, 5 => 0.95, 6 => 0.5];
        return $factors[$dayOfWeek] ?? 1.0;
    }

    private function calculateTrend(array $values): float
    {
        if (count($values) < 2) return 0;
        $n = count($values);
        $sumX = $sumY = $sumXY = $sumX2 = 0;
        for ($i = 0; $i < $n; $i++) {
            $sumX += $i;
            $sumY += $values[$i];
            $sumXY += $i * $values[$i];
            $sumX2 += $i * $i;
        }
        $denominator = ($n * $sumX2) - ($sumX * $sumX);
        return $denominator != 0 ? (($n * $sumXY) - ($sumX * $sumY)) / $denominator : 0;
    }
}
