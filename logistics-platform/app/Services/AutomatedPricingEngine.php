<?php

namespace App\Services;

use App\Models\DynamicPrice;
use App\Models\PricingRule;
use App\Models\TransportOrder;
use App\Models\FreightOffer;
use App\Models\VehicleOffer;
use App\Models\BarometerSnapshot;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AutomatedPricingEngine
{
    /**
     * Calculate an automated price for a shipment using rules + historical data.
     *
     * Flow:
     *  1. Gather historical market data (completed orders, barometer)
     *  2. Build statistical model (weighted moving averages, trend, volatility)
     *  3. Apply configurable pricing rules (surcharges, multipliers, discounts)
     *  4. Clamp to min/max, compare to market, generate confidence
     */
    public function calculatePrice(array $params): array
    {
        $origin      = $params['origin_country'];
        $destination  = $params['destination_country'];
        $vehicleType  = $params['vehicle_type'] ?? null;
        $distanceKm   = $params['distance_km'] ?? null;
        $weightKg     = $params['weight_kg'] ?? null;
        $cargoType    = $params['cargo_type'] ?? null;
        $loadingDate  = $params['loading_date'] ?? null;
        $isHazardous  = $params['is_hazardous'] ?? false;
        $isTempControlled = $params['temperature_controlled'] ?? false;

        // 1. Historical analysis
        $historical = $this->analyzeHistoricalPricing($origin, $destination, $vehicleType);

        // 2. Market supply/demand snapshot
        $market = $this->getMarketSnapshot($origin, $destination);

        // 3. Compute base price from historical data or fallback
        $basePricePerKm = $historical['weighted_avg_per_km'] ?? $this->getFallbackBaseRate($vehicleType);

        // 4. Apply trend adjustment (simple linear regression coefficient)
        $trendAdjustment = 1.0 + ($historical['trend_coefficient'] ?? 0);
        $adjustedPrice = $basePricePerKm * $trendAdjustment;

        // 5. Apply supply/demand elasticity
        $elasticity = $this->calculateElasticity($market['demand_ratio']);
        $adjustedPrice *= $elasticity;

        // 6. Apply matching pricing rules (sorted by priority)
        $shipmentContext = [
            'origin_country'   => $origin,
            'destination_country' => $destination,
            'vehicle_type'     => $vehicleType,
            'cargo_type'       => $cargoType,
            'weight_kg'        => $weightKg,
            'distance_km'      => $distanceKm,
            'is_hazardous'     => $isHazardous,
            'temperature_controlled' => $isTempControlled,
            'loading_date'     => $loadingDate,
            'loading_day_of_week' => $loadingDate ? date('N', strtotime($loadingDate)) : null,
            'month'            => $loadingDate ? (int) date('m', strtotime($loadingDate)) : now()->month,
        ];

        $appliedRules = [];
        $rules = $this->getMatchingRules($origin, $destination, $vehicleType, $shipmentContext);

        foreach ($rules as $rule) {
            $before = $adjustedPrice;
            $adjustedPrice = $rule->applyToPrice($adjustedPrice, $distanceKm ?? 0);
            if (abs($adjustedPrice - $before) > 0.001) {
                $appliedRules[] = [
                    'rule_id'   => $rule->id,
                    'name'      => $rule->name,
                    'type'      => $rule->rule_type,
                    'impact'    => round($adjustedPrice - $before, 4),
                    'impact_pct' => $before > 0 ? round(($adjustedPrice - $before) / $before * 100, 2) : 0,
                ];
            }
        }

        // 7. Calculate total price if distance provided
        $totalPrice = $distanceKm ? round($adjustedPrice * $distanceKm, 2) : null;

        // 8. Weight surcharge
        $weightSurcharge = 0;
        if ($weightKg && $distanceKm) {
            if ($weightKg > 24000) {
                $weightSurcharge = round(($weightKg - 24000) * 0.003 * ($distanceKm / 100), 2);
            } elseif ($weightKg > 20000) {
                $weightSurcharge = round(($weightKg - 20000) * 0.002 * ($distanceKm / 100), 2);
            }
            $totalPrice = $totalPrice ? $totalPrice + $weightSurcharge : null;
        }

        // 9. Confidence score (based on sample size + volatility)
        $confidence = $this->calculateConfidence($historical);

        // 10. Market comparison
        $marketComparison = null;
        if ($historical['market_avg_per_km']) {
            $deviation = ($adjustedPrice - $historical['market_avg_per_km']) / $historical['market_avg_per_km'] * 100;
            $marketComparison = [
                'market_avg' => round($historical['market_avg_per_km'], 4),
                'engine_price' => round($adjustedPrice, 4),
                'deviation_pct' => round($deviation, 2),
                'assessment' => abs($deviation) <= 5 ? 'market_aligned'
                    : ($deviation > 0 ? 'above_market' : 'below_market'),
            ];
        }

        // 11. Price range (using historical volatility)
        $volatility = $historical['volatility'] ?? 0.15;
        $priceRange = [
            'low'  => round($adjustedPrice * (1 - $volatility), 4),
            'high' => round($adjustedPrice * (1 + $volatility), 4),
        ];

        // 12. Persist for auditing
        $record = DynamicPrice::create([
            'origin_country'       => $origin,
            'destination_country'  => $destination,
            'vehicle_type'         => $vehicleType,
            'base_price_per_km'    => $basePricePerKm,
            'dynamic_price_per_km' => round($adjustedPrice, 4),
            'surge_multiplier'     => round($elasticity, 4),
            'demand_index'         => $market['demand_count'],
            'supply_index'         => $market['supply_count'],
            'fuel_surcharge_pct'   => 0,
            'seasonal_factor'      => $trendAdjustment,
            'weather_factor'       => 1.0,
            'price_components'     => [
                'historical_base' => $basePricePerKm,
                'trend_adj' => $trendAdjustment,
                'elasticity' => $elasticity,
                'rules' => $appliedRules,
            ],
            'valid_from'  => now(),
            'valid_until'  => now()->addHours(6),
            'currency'     => 'EUR',
        ]);

        return [
            'price_per_km'       => round($adjustedPrice, 4),
            'total_price'        => $totalPrice,
            'weight_surcharge'   => $weightSurcharge,
            'price_range'        => $priceRange,
            'currency'           => 'EUR',
            'confidence'         => $confidence,
            'market_comparison'  => $marketComparison,
            'applied_rules'      => $appliedRules,
            'historical_basis'   => [
                'sample_size'    => $historical['sample_size'],
                'period_days'    => $historical['period_days'],
                'trend'          => $historical['trend_direction'],
                'volatility'     => round($volatility * 100, 1) . '%',
            ],
            'valid_until'        => $record->valid_until->toIso8601String(),
            'pricing_id'         => $record->id,
        ];
    }

    /**
     * Analyze historical pricing data for a route.
     * Uses exponentially-weighted moving average (EWMA) for trend detection.
     */
    public function analyzeHistoricalPricing(
        string $origin,
        string $destination,
        ?string $vehicleType = null,
        int $periodDays = 90
    ): array {
        $cacheKey = "pricing_analysis:{$origin}:{$destination}:{$vehicleType}:{$periodDays}";

        return Cache::remember($cacheKey, 1800, function () use ($origin, $destination, $vehicleType, $periodDays) {
            // Completed orders for this route in the period
            $query = TransportOrder::where('status', 'completed')
                ->where('pickup_country', $origin)
                ->where('delivery_country', $destination)
                ->where('created_at', '>=', now()->subDays($periodDays))
                ->whereNotNull('total_price');

            $orders = $query->select([
                'total_price',
                'distance_km',
                'created_at',
                DB::raw('CASE WHEN distance_km > 0 THEN total_price / distance_km ELSE NULL END as price_per_km'),
            ])->orderBy('created_at')->get();

            $pricesPerKm = $orders->pluck('price_per_km')->filter()->values();

            if ($pricesPerKm->isEmpty()) {
                // Fall back to barometer data
                $barometer = BarometerSnapshot::where('origin_country', $origin)
                    ->where('destination_country', $destination)
                    ->whereNotNull('avg_price_per_km')
                    ->orderByDesc('snapshot_date')
                    ->first();

                return [
                    'sample_size'        => 0,
                    'period_days'        => $periodDays,
                    'weighted_avg_per_km' => $barometer?->avg_price_per_km ? (float) $barometer->avg_price_per_km : null,
                    'market_avg_per_km'  => $barometer?->avg_price_per_km ? (float) $barometer->avg_price_per_km : null,
                    'trend_coefficient'   => 0,
                    'trend_direction'     => 'insufficient_data',
                    'volatility'          => 0.15,
                    'percentiles'         => null,
                ];
            }

            // Basic statistics
            $avg = $pricesPerKm->avg();
            $min = $pricesPerKm->min();
            $max = $pricesPerKm->max();
            $count = $pricesPerKm->count();

            // Standard deviation → volatility
            $variance = $pricesPerKm->reduce(fn($carry, $v) => $carry + pow($v - $avg, 2), 0) / max($count, 1);
            $stdDev = sqrt($variance);
            $volatility = $avg > 0 ? $stdDev / $avg : 0.15;

            // Exponentially-weighted moving average (decay = 0.94)
            $decay = 0.94;
            $ewma = 0;
            $weightSum = 0;
            foreach ($pricesPerKm as $i => $price) {
                $w = pow($decay, $count - 1 - $i); // recent data gets more weight
                $ewma += $price * $w;
                $weightSum += $w;
            }
            $ewma = $weightSum > 0 ? $ewma / $weightSum : $avg;

            // Trend: simple linear regression on price_per_km vs time index
            $trend = $this->linearRegressionSlope($pricesPerKm->toArray());
            $trendCoefficient = $avg > 0 ? $trend / $avg : 0; // normalize
            $trendCoefficient = max(-0.10, min(0.10, $trendCoefficient)); // clamp ±10%

            // Percentiles
            $sorted = $pricesPerKm->sort()->values();
            $p25 = $sorted[intval($count * 0.25)] ?? $min;
            $p50 = $sorted[intval($count * 0.50)] ?? $avg;
            $p75 = $sorted[intval($count * 0.75)] ?? $max;

            return [
                'sample_size'        => $count,
                'period_days'        => $periodDays,
                'weighted_avg_per_km' => round($ewma, 4),
                'market_avg_per_km'  => round($avg, 4),
                'min_per_km'         => round($min, 4),
                'max_per_km'         => round($max, 4),
                'std_dev'            => round($stdDev, 4),
                'trend_coefficient'   => round($trendCoefficient, 6),
                'trend_direction'     => $trendCoefficient > 0.01 ? 'rising'
                    : ($trendCoefficient < -0.01 ? 'falling' : 'stable'),
                'volatility'          => round($volatility, 4),
                'percentiles'         => [
                    'p25' => round($p25, 4),
                    'p50' => round($p50, 4),
                    'p75' => round($p75, 4),
                ],
            ];
        });
    }

    /**
     * Get price alerts: routes where current price deviates significantly from historical.
     */
    public function getPriceAlerts(float $thresholdPct = 15.0): array
    {
        $activePrices = DynamicPrice::where('valid_until', '>=', now())
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        $alerts = [];

        foreach ($activePrices as $price) {
            $historical = $this->analyzeHistoricalPricing(
                $price->origin_country,
                $price->destination_country,
                $price->vehicle_type,
                90
            );

            if (!$historical['market_avg_per_km']) continue;

            $deviation = ($price->dynamic_price_per_km - $historical['market_avg_per_km'])
                / $historical['market_avg_per_km'] * 100;

            if (abs($deviation) >= $thresholdPct) {
                $alerts[] = [
                    'route'         => "{$price->origin_country} → {$price->destination_country}",
                    'vehicle_type'  => $price->vehicle_type,
                    'current_price' => round($price->dynamic_price_per_km, 4),
                    'market_avg'    => round($historical['market_avg_per_km'], 4),
                    'deviation_pct' => round($deviation, 2),
                    'alert_type'    => $deviation > 0 ? 'price_above_market' : 'price_below_market',
                    'severity'      => abs($deviation) >= 30 ? 'critical'
                        : (abs($deviation) >= 20 ? 'warning' : 'info'),
                    'trend'         => $historical['trend_direction'],
                    'sample_size'   => $historical['sample_size'],
                    'detected_at'   => now()->toIso8601String(),
                ];
            }
        }

        // Sort by severity (critical first)
        usort($alerts, fn($a, $b) => match (true) {
            $a['severity'] === 'critical' && $b['severity'] !== 'critical' => -1,
            $a['severity'] !== 'critical' && $b['severity'] === 'critical' => 1,
            default => abs($b['deviation_pct']) <=> abs($a['deviation_pct']),
        });

        return $alerts;
    }

    /**
     * Forecast price for a future date range using trend extrapolation.
     */
    public function forecastPrice(
        string $origin,
        string $destination,
        ?string $vehicleType,
        int $forecastDays = 30
    ): array {
        $historical = $this->analyzeHistoricalPricing($origin, $destination, $vehicleType, 180);

        $basePrice = $historical['weighted_avg_per_km'] ?? $this->getFallbackBaseRate($vehicleType);
        $dailyTrend = ($historical['trend_coefficient'] ?? 0) / ($historical['period_days'] ?: 90);

        $forecast = [];
        for ($day = 1; $day <= $forecastDays; $day += max(1, intval($forecastDays / 30))) {
            $futureDate = now()->addDays($day);
            $projected = $basePrice * (1 + $dailyTrend * $day);

            // Apply seasonal factor
            $seasonalFactors = [
                1 => 0.92, 2 => 0.94, 3 => 0.98, 4 => 1.0, 5 => 1.02, 6 => 1.05,
                7 => 0.95, 8 => 0.90, 9 => 1.08, 10 => 1.10, 11 => 1.03, 12 => 0.95,
            ];
            $projected *= $seasonalFactors[$futureDate->month] ?? 1.0;

            $volatility = $historical['volatility'] ?? 0.15;
            $forecast[] = [
                'date'       => $futureDate->toDateString(),
                'projected_price' => round($projected, 4),
                'range_low'  => round($projected * (1 - $volatility), 4),
                'range_high' => round($projected * (1 + $volatility), 4),
            ];
        }

        return [
            'route'       => "{$origin} → {$destination}",
            'vehicle_type' => $vehicleType,
            'base_price'  => round($basePrice, 4),
            'trend'       => $historical['trend_direction'],
            'forecast'    => $forecast,
            'confidence'  => $this->calculateConfidence($historical),
            'methodology' => 'EWMA + linear trend extrapolation + seasonal adjustment',
        ];
    }

    /**
     * Get route profitability analysis.
     */
    public function getRouteProfitability(int $topN = 20): array
    {
        $routes = TransportOrder::where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6))
            ->whereNotNull('total_price')
            ->select([
                'pickup_country',
                'delivery_country',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_price) as total_revenue'),
                DB::raw('AVG(total_price) as avg_price'),
                DB::raw('AVG(distance_km) as avg_distance'),
                DB::raw('AVG(CASE WHEN distance_km > 0 THEN total_price / distance_km ELSE NULL END) as avg_price_per_km'),
                DB::raw('STDDEV(CASE WHEN distance_km > 0 THEN total_price / distance_km ELSE NULL END) as price_volatility'),
            ])
            ->groupBy('pickup_country', 'delivery_country')
            ->having('order_count', '>=', 3)
            ->orderByDesc('total_revenue')
            ->limit($topN)
            ->get();

        return $routes->map(function ($route) {
            $avgPerKm = $route->avg_price_per_km ?? 0;
            $volatility = ($avgPerKm > 0 && $route->price_volatility)
                ? round($route->price_volatility / $avgPerKm, 4) : 0;

            return [
                'route'          => "{$route->pickup_country} → {$route->delivery_country}",
                'origin'         => $route->pickup_country,
                'destination'    => $route->delivery_country,
                'order_count'    => $route->order_count,
                'total_revenue'  => round($route->total_revenue, 2),
                'avg_price'      => round($route->avg_price, 2),
                'avg_distance_km' => round($route->avg_distance ?? 0),
                'avg_price_per_km' => round($avgPerKm, 4),
                'volatility'     => $volatility,
                'stability'      => $volatility < 0.10 ? 'high' : ($volatility < 0.25 ? 'medium' : 'low'),
            ];
        })->toArray();
    }

    // ─── Pricing Rules CRUD ─────────────────────────────────────

    /**
     * List all pricing rules.
     */
    public function listRules(array $filters = []): array
    {
        $query = PricingRule::query();

        if (!empty($filters['active_only'])) {
            $query->active();
        }
        if (!empty($filters['rule_type'])) {
            $query->ofType($filters['rule_type']);
        }
        if (!empty($filters['origin_country'])) {
            $query->where('origin_country', $filters['origin_country']);
        }

        return $query->orderBy('priority')->get()->toArray();
    }

    /**
     * Create a new pricing rule.
     */
    public function createRule(array $data): PricingRule
    {
        return PricingRule::create($data);
    }

    /**
     * Update a pricing rule.
     */
    public function updateRule(int $id, array $data): PricingRule
    {
        $rule = PricingRule::findOrFail($id);
        $rule->update($data);
        Cache::tags(['pricing_rules'])->flush();
        return $rule->fresh();
    }

    /**
     * Delete a pricing rule.
     */
    public function deleteRule(int $id): bool
    {
        $rule = PricingRule::findOrFail($id);
        Cache::tags(['pricing_rules'])->flush();
        return $rule->delete();
    }

    // ─── Private Helpers ────────────────────────────────────────

    /**
     * Get matching pricing rules for a shipment, sorted by priority.
     */
    private function getMatchingRules(
        string $origin,
        string $destination,
        ?string $vehicleType,
        array $context
    ): \Illuminate\Support\Collection {
        $rules = PricingRule::active()
            ->forRoute($origin, $destination)
            ->forVehicle($vehicleType)
            ->orderBy('priority')
            ->get();

        return $rules->filter(fn(PricingRule $rule) => $rule->matchesConditions($context));
    }

    /**
     * Get market supply/demand snapshot.
     */
    private function getMarketSnapshot(string $origin, string $destination): array
    {
        $demandCount = FreightOffer::where('origin_country', $origin)
            ->where('destination_country', $destination)
            ->where('status', 'active')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $supplyCount = VehicleOffer::where('status', 'available')
            ->where(function ($q) use ($origin) {
                $q->where('current_country', $origin)->orWhereNull('current_country');
            })
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        $demandRatio = $supplyCount > 0 ? $demandCount / $supplyCount : ($demandCount > 0 ? 2.0 : 1.0);

        return [
            'demand_count' => $demandCount,
            'supply_count' => $supplyCount,
            'demand_ratio' => round($demandRatio, 2),
        ];
    }

    /**
     * Calculate price elasticity from demand/supply ratio.
     * Uses a sigmoid-like function clamped between 0.80 and 1.50.
     */
    private function calculateElasticity(float $demandRatio): float
    {
        // Logistic curve: centers at 1.0 (balanced), asymptotes at bounds
        $midpoint = 1.0;
        $steepness = 2.0;
        $rawElasticity = 1.0 + 0.35 * (2 / (1 + exp(-$steepness * ($demandRatio - $midpoint))) - 1);

        return round(max(0.80, min(1.50, $rawElasticity)), 4);
    }

    /**
     * Linear regression slope for price trend detection.
     */
    private function linearRegressionSlope(array $values): float
    {
        $n = count($values);
        if ($n < 3) return 0;

        $sumX = 0; $sumY = 0; $sumXY = 0; $sumX2 = 0;
        foreach ($values as $i => $y) {
            $sumX += $i;
            $sumY += $y;
            $sumXY += $i * $y;
            $sumX2 += $i * $i;
        }

        $denom = $n * $sumX2 - $sumX * $sumX;
        if ($denom == 0) return 0;

        return ($n * $sumXY - $sumX * $sumY) / $denom;
    }

    /**
     * Calculate confidence score based on data quality.
     */
    private function calculateConfidence(array $historical): array
    {
        $sampleSize = $historical['sample_size'] ?? 0;
        $volatility = $historical['volatility'] ?? 0.15;

        // Sample size factor: 0-1 (saturates around 50 samples)
        $sizeFactor = min(1.0, $sampleSize / 50);

        // Volatility factor: lower volatility = higher confidence
        $volFactor = max(0.2, 1 - $volatility);

        // Data recency: full credit if period <= 90, decays after
        $periodDays = $historical['period_days'] ?? 90;
        $recencyFactor = min(1.0, 90 / max($periodDays, 1));

        $score = round(($sizeFactor * 0.5 + $volFactor * 0.3 + $recencyFactor * 0.2) * 100, 1);

        return [
            'score'  => $score,
            'level'  => $score >= 80 ? 'high' : ($score >= 50 ? 'medium' : 'low'),
            'factors' => [
                'sample_size'  => $sampleSize,
                'volatility'   => round($volatility * 100, 1) . '%',
                'period_days'  => $periodDays,
            ],
        ];
    }

    /**
     * Fallback base rates per vehicle type.
     */
    private function getFallbackBaseRate(?string $vehicleType): float
    {
        $rates = [
            'standard_truck' => 1.10,
            'mega_trailer'   => 1.15,
            'refrigerated'   => 1.45,
            'tanker'         => 1.50,
            'flatbed'        => 1.20,
            'container'      => 1.30,
            'curtainsider'   => 1.12,
            'box_truck'      => 1.05,
            'box'            => 1.15,
            'van'            => 0.85,
        ];

        return $rates[$vehicleType] ?? 1.15;
    }
}
