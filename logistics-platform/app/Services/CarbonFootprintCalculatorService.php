<?php

namespace App\Services;

use App\Models\CarbonFootprint;
use App\Models\TransportOrder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Enhanced Carbon Footprint Calculator.
 *
 * Implements:
 * - GLEC Framework v3 (ISO 14083) for logistics emissions
 * - Well-to-Wheel (WTW) = Well-to-Tank (WTT) + Tank-to-Wheel (TTW)
 * - Scope 1 / 2 / 3 GHG Protocol breakdown
 * - Multimodal transport carbon comparison (road, rail, sea, air, inland waterway)
 * - Fleet-level carbon benchmarking
 * - Carbon reduction recommendations
 * - EU ETS integration (cap & trade pricing)
 */
class CarbonFootprintCalculatorService
{
    // ── GLEC v3 / ISO 14083 — Well-to-Wheel Emission Factors ───
    // kg CO₂e per ton-km (WTW = WTT + TTW)

    /**
     * Road emission factors by vehicle + fuel (kg CO₂e / ton-km, WTW).
     */
    private const ROAD_FACTORS = [
        // Vehicle type => [fuel => [ttw, wtt, total_wtw]]
        'van' => [
            'diesel' => [0.290, 0.055, 0.345],
            'electric' => [0.000, 0.100, 0.100],
            'cng' => [0.250, 0.045, 0.295],
            'lng' => [0.260, 0.050, 0.310],
            'hvo' => [0.015, 0.020, 0.035],
            'hydrogen' => [0.000, 0.120, 0.120],
        ],
        'box_truck' => [
            'diesel' => [0.180, 0.034, 0.214],
            'electric' => [0.000, 0.065, 0.065],
            'cng' => [0.155, 0.030, 0.185],
            'hvo' => [0.009, 0.012, 0.021],
        ],
        'standard_truck' => [
            'diesel' => [0.062, 0.012, 0.074],
            'lng' => [0.053, 0.010, 0.063],
            'cng' => [0.050, 0.010, 0.060],
            'hvo' => [0.003, 0.004, 0.007],
            'electric' => [0.000, 0.022, 0.022],
            'hydrogen' => [0.000, 0.035, 0.035],
            'hybrid' => [0.043, 0.008, 0.051],
        ],
        'mega_trailer' => [
            'diesel' => [0.058, 0.011, 0.069],
            'lng' => [0.049, 0.009, 0.058],
            'hvo' => [0.003, 0.004, 0.007],
        ],
        'refrigerated' => [
            'diesel' => [0.095, 0.018, 0.113],
            'electric' => [0.000, 0.030, 0.030],
            'hvo' => [0.005, 0.006, 0.011],
        ],
    ];

    /**
     * Non-road transport mode factors (kg CO₂e / ton-km, WTW).
     */
    private const MODE_FACTORS = [
        'rail' => [
            'electric' => ['ttw' => 0.000, 'wtt' => 0.022, 'wtw' => 0.022],
            'diesel' => ['ttw' => 0.035, 'wtt' => 0.007, 'wtw' => 0.042],
            'default' => ['ttw' => 0.018, 'wtt' => 0.015, 'wtw' => 0.033],
        ],
        'sea_container' => [
            'hfo' => ['ttw' => 0.008, 'wtt' => 0.002, 'wtw' => 0.010],
            'lng' => ['ttw' => 0.007, 'wtt' => 0.002, 'wtw' => 0.009],
            'default' => ['ttw' => 0.008, 'wtt' => 0.002, 'wtw' => 0.010],
        ],
        'sea_bulk' => [
            'default' => ['ttw' => 0.005, 'wtt' => 0.001, 'wtw' => 0.006],
        ],
        'inland_waterway' => [
            'default' => ['ttw' => 0.030, 'wtt' => 0.006, 'wtw' => 0.036],
        ],
        'air_cargo' => [
            'default' => ['ttw' => 0.570, 'wtt' => 0.090, 'wtw' => 0.660],
        ],
        'air_express' => [
            'default' => ['ttw' => 1.100, 'wtt' => 0.170, 'wtw' => 1.270],
        ],
    ];

    /**
     * EU ETS carbon prices (EUR/ton CO₂).
     */
    private const ETS_PRICES = [
        '2024' => 65.0,
        '2025' => 75.0,
        '2026' => 85.0,
    ];

    // ── GLEC v3 Calculation ─────────────────────────────────────

    /**
     * Calculate emissions per GLEC Framework v3 / ISO 14083.
     */
    public function calculateGlec(array $params): array
    {
        $distanceKm = $params['distance_km'];
        $weightTons = ($params['weight_kg'] ?? 20000) / 1000;
        $vehicleType = $params['vehicle_type'] ?? 'standard_truck';
        $fuelType = $params['fuel_type'] ?? 'diesel';
        $loadFactor = ($params['load_factor_pct'] ?? 60) / 100;
        $mode = $params['mode'] ?? 'road';
        $emptyReturn = $params['empty_return'] ?? false;

        // Get factors
        $factors = $this->getWtwFactors($mode, $vehicleType, $fuelType);

        // ton-km
        $tonKm = $weightTons * $distanceKm;

        // Apply load factor correction (GLEC v3: normalise to actual utilisation)
        $loadCorrection = $loadFactor > 0 ? (0.60 / $loadFactor) : 1.0;

        // Empty return factor (if round trip with empty return, ~50% increase)
        $emptyFactor = $emptyReturn ? 1.5 : 1.0;

        $ttwKg = round($factors['ttw'] * $tonKm * $loadCorrection * $emptyFactor, 3);
        $wttKg = round($factors['wtt'] * $tonKm * $loadCorrection * $emptyFactor, 3);
        $wtwKg = $ttwKg + $wttKg;

        // Per-unit intensities
        $co2PerKm = $distanceKm > 0 ? round($wtwKg / $distanceKm, 4) : 0;
        $co2PerTonKm = $tonKm > 0 ? round($wtwKg / $tonKm, 6) : 0;

        // Industry benchmark (diesel standard truck, 60% load)
        $benchmarkFactor = self::ROAD_FACTORS['standard_truck']['diesel'][2] ?? 0.074;
        $benchmarkKg = round($benchmarkFactor * $tonKm, 2);
        $savingsPct = $benchmarkKg > 0 ? round((($benchmarkKg - $wtwKg) / $benchmarkKg) * 100, 1) : 0;

        // EU ETS cost
        $etsYear = (string) now()->year;
        $etsPrice = self::ETS_PRICES[$etsYear] ?? 75.0;
        $etsCost = round(($wtwKg / 1000) * $etsPrice, 2);

        // Voluntary offset cost (Gold Standard ~ €30/ton)
        $offsetCost = round(($wtwKg / 1000) * 30, 2);

        return [
            'methodology' => 'GLEC Framework v3 / ISO 14083',
            'mode' => $mode,
            'vehicle_type' => $vehicleType,
            'fuel_type' => $fuelType,
            'distance_km' => $distanceKm,
            'weight_tons' => $weightTons,
            'ton_km' => round($tonKm, 1),
            'load_factor' => $loadFactor,
            'emissions' => [
                'ttw_kg_co2e' => $ttwKg,
                'wtt_kg_co2e' => $wttKg,
                'wtw_kg_co2e' => round($wtwKg, 3),
                'co2e_per_km' => $co2PerKm,
                'co2e_per_ton_km' => $co2PerTonKm,
            ],
            'benchmark' => [
                'industry_avg_kg' => $benchmarkKg,
                'savings_vs_avg_pct' => $savingsPct,
            ],
            'costs' => [
                'eu_ets_eur' => $etsCost,
                'voluntary_offset_eur' => $offsetCost,
                'ets_price_per_ton' => $etsPrice,
            ],
            'scope_breakdown' => $this->getScopeBreakdown($ttwKg, $wttKg, $mode),
        ];
    }

    /**
     * Compare emissions across transport modes.
     */
    public function compareMultimodal(array $params): array
    {
        $baseParams = [
            'distance_km' => $params['distance_km'],
            'weight_kg' => $params['weight_kg'] ?? 20000,
            'load_factor_pct' => $params['load_factor_pct'] ?? 60,
        ];

        $modes = [
            ['mode' => 'road', 'vehicle_type' => 'standard_truck', 'fuel_type' => 'diesel', 'label' => 'Road (Diesel Truck)'],
            ['mode' => 'road', 'vehicle_type' => 'standard_truck', 'fuel_type' => 'lng', 'label' => 'Road (LNG Truck)'],
            ['mode' => 'road', 'vehicle_type' => 'standard_truck', 'fuel_type' => 'electric', 'label' => 'Road (Electric Truck)'],
            ['mode' => 'road', 'vehicle_type' => 'standard_truck', 'fuel_type' => 'hvo', 'label' => 'Road (HVO/Renewable Diesel)'],
            ['mode' => 'rail', 'vehicle_type' => null, 'fuel_type' => 'default', 'label' => 'Rail (Average)'],
            ['mode' => 'rail', 'vehicle_type' => null, 'fuel_type' => 'electric', 'label' => 'Rail (Electric)'],
            ['mode' => 'sea_container', 'vehicle_type' => null, 'fuel_type' => 'default', 'label' => 'Sea Container (HFO)'],
            ['mode' => 'inland_waterway', 'vehicle_type' => null, 'fuel_type' => 'default', 'label' => 'Inland Waterway'],
            ['mode' => 'air_cargo', 'vehicle_type' => null, 'fuel_type' => 'default', 'label' => 'Air Cargo'],
        ];

        $results = [];
        foreach ($modes as $m) {
            $calc = $this->calculateGlec(array_merge($baseParams, $m));
            $results[] = [
                'label' => $m['label'],
                'mode' => $m['mode'],
                'fuel_type' => $m['fuel_type'],
                'wtw_kg_co2e' => $calc['emissions']['wtw_kg_co2e'],
                'co2e_per_ton_km' => $calc['emissions']['co2e_per_ton_km'],
                'eu_ets_cost' => $calc['costs']['eu_ets_eur'],
                'offset_cost' => $calc['costs']['voluntary_offset_eur'],
            ];
        }

        // Sort by emissions
        usort($results, fn($a, $b) => $a['wtw_kg_co2e'] <=> $b['wtw_kg_co2e']);

        return [
            'distance_km' => $baseParams['distance_km'],
            'weight_kg' => $baseParams['weight_kg'],
            'comparisons' => $results,
            'greenest' => $results[0] ?? null,
            'recommendation' => $this->generateModeRecommendation($results, $baseParams['distance_km']),
        ];
    }

    /**
     * Calculate multimodal route emissions (e.g. truck → rail → truck).
     */
    public function calculateMultimodalRoute(array $legs): array
    {
        $totalTtw = 0;
        $totalWtt = 0;
        $legResults = [];

        foreach ($legs as $leg) {
            $calc = $this->calculateGlec($leg);
            $totalTtw += $calc['emissions']['ttw_kg_co2e'];
            $totalWtt += $calc['emissions']['wtt_kg_co2e'];
            $legResults[] = [
                'mode' => $leg['mode'],
                'distance_km' => $leg['distance_km'],
                'emissions' => $calc['emissions'],
                'fuel_type' => $leg['fuel_type'] ?? 'diesel',
            ];
        }

        $totalWtw = $totalTtw + $totalWtt;
        $totalDistance = array_sum(array_column($legs, 'distance_km'));

        // Compare with all-road alternative
        $allRoad = $this->calculateGlec([
            'distance_km' => $totalDistance,
            'weight_kg' => $legs[0]['weight_kg'] ?? 20000,
            'mode' => 'road',
            'vehicle_type' => 'standard_truck',
            'fuel_type' => 'diesel',
        ]);

        return [
            'legs' => $legResults,
            'total' => [
                'ttw_kg_co2e' => round($totalTtw, 3),
                'wtt_kg_co2e' => round($totalWtt, 3),
                'wtw_kg_co2e' => round($totalWtw, 3),
                'total_distance_km' => $totalDistance,
            ],
            'vs_all_road' => [
                'all_road_wtw_kg' => $allRoad['emissions']['wtw_kg_co2e'],
                'saving_kg' => round($allRoad['emissions']['wtw_kg_co2e'] - $totalWtw, 3),
                'saving_pct' => $allRoad['emissions']['wtw_kg_co2e'] > 0
                    ? round((($allRoad['emissions']['wtw_kg_co2e'] - $totalWtw) / $allRoad['emissions']['wtw_kg_co2e']) * 100, 1)
                    : 0,
            ],
        ];
    }

    // ── Fleet Benchmarking ──────────────────────────────────────

    /**
     * Fleet-level carbon benchmarking.
     */
    public function fleetBenchmark(int $companyId, int $months = 12): array
    {
        $cacheKey = "carbon_benchmark:{$companyId}:{$months}";

        return Cache::remember($cacheKey, 1800, function () use ($companyId, $months) {
            $since = now()->subMonths($months);

            // Company metrics
            $companyData = CarbonFootprint::where('company_id', $companyId)
                ->where('created_at', '>=', $since)
                ->select(
                    DB::raw('SUM(co2_kg) as total_co2'),
                    DB::raw('SUM(distance_km) as total_km'),
                    DB::raw('SUM(weight_kg * distance_km) / 1000 as total_ton_km'),
                    DB::raw('AVG(co2_per_km) as avg_co2_per_km'),
                    DB::raw('COUNT(*) as shipment_count'),
                    DB::raw('SUM(offset_purchased_kg) as total_offset')
                )
                ->first();

            // Industry average
            $industryAvg = CarbonFootprint::where('created_at', '>=', $since)
                ->select(
                    DB::raw('AVG(co2_per_km) as avg_co2_per_km'),
                    DB::raw('AVG(CASE WHEN weight_kg > 0 THEN co2_kg / (weight_kg / 1000 * distance_km) END) as avg_co2_per_ton_km')
                )
                ->first();

            // Percentile ranking
            $allCompanyAvgs = CarbonFootprint::where('created_at', '>=', $since)
                ->groupBy('company_id')
                ->select('company_id', DB::raw('AVG(co2_per_km) as avg_co2'))
                ->orderBy('avg_co2')
                ->pluck('avg_co2')
                ->toArray();

            $companyAvg = $companyData->avg_co2_per_km ?? 0;
            $betterThan = count(array_filter($allCompanyAvgs, fn($v) => $v > $companyAvg));
            $percentile = count($allCompanyAvgs) > 0
                ? round(($betterThan / count($allCompanyAvgs)) * 100, 0)
                : 50;

            // Monthly trend
            $monthlyTrend = CarbonFootprint::where('company_id', $companyId)
                ->where('created_at', '>=', $since)
                ->select(
                    DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                    DB::raw('SUM(co2_kg) as co2_kg'),
                    DB::raw('AVG(co2_per_km) as avg_co2_per_km'),
                    DB::raw('COUNT(*) as shipments')
                )
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Fuel type distribution
            $fuelBreakdown = CarbonFootprint::where('company_id', $companyId)
                ->where('created_at', '>=', $since)
                ->select(
                    'fuel_type',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('SUM(co2_kg) as total_co2'),
                    DB::raw('SUM(co2_kg) / SUM(distance_km) as intensity')
                )
                ->groupBy('fuel_type')
                ->get();

            // Year-over-year improvement
            $previousPeriod = CarbonFootprint::where('company_id', $companyId)
                ->whereBetween('created_at', [$since->copy()->subMonths($months), $since])
                ->avg('co2_per_km');

            $yoyImprovement = $previousPeriod && $previousPeriod > 0
                ? round((($previousPeriod - $companyAvg) / $previousPeriod) * 100, 1)
                : null;

            return [
                'company_id' => $companyId,
                'period_months' => $months,
                'company_metrics' => [
                    'total_co2_kg' => round($companyData->total_co2 ?? 0, 1),
                    'total_co2_tons' => round(($companyData->total_co2 ?? 0) / 1000, 2),
                    'total_distance_km' => round($companyData->total_km ?? 0, 0),
                    'total_ton_km' => round($companyData->total_ton_km ?? 0, 0),
                    'avg_co2_per_km' => round($companyAvg, 4),
                    'shipment_count' => $companyData->shipment_count ?? 0,
                    'offset_pct' => ($companyData->total_co2 ?? 0) > 0
                        ? round(($companyData->total_offset / $companyData->total_co2) * 100, 1) : 0,
                ],
                'benchmark' => [
                    'industry_avg_co2_per_km' => round($industryAvg->avg_co2_per_km ?? 0.85, 4),
                    'industry_avg_co2_per_ton_km' => round($industryAvg->avg_co2_per_ton_km ?? 0.074, 6),
                    'company_percentile' => $percentile,
                    'percentile_label' => "Better than {$percentile}% of companies",
                ],
                'trend' => [
                    'monthly' => $monthlyTrend,
                    'yoy_improvement_pct' => $yoyImprovement,
                ],
                'fuel_breakdown' => $fuelBreakdown,
                'recommendations' => $this->generateRecommendations($companyId, $fuelBreakdown, $companyAvg),
            ];
        });
    }

    // ── Carbon Reduction Recommendations ────────────────────────

    /**
     * Generate actionable carbon reduction recommendations.
     */
    public function generateRecommendations(int $companyId, $fuelBreakdown = null, float $avgCo2PerKm = 0): array
    {
        $recommendations = [];

        // Analyse fuel mix
        $dieselPct = 0;
        if ($fuelBreakdown) {
            $total = $fuelBreakdown->sum('count');
            $dieselCount = $fuelBreakdown->where('fuel_type', 'diesel')->sum('count');
            $dieselPct = $total > 0 ? ($dieselCount / $total) * 100 : 0;
        }

        if ($dieselPct > 80) {
            $recommendations[] = [
                'category' => 'fuel_transition',
                'priority' => 'high',
                'title' => 'Transition to alternative fuels',
                'description' => "{$dieselPct}% of your fleet uses diesel. Switching 20% to HVO (Hydrotreated Vegetable Oil) could reduce emissions by ~18%.",
                'potential_reduction_pct' => 18,
                'estimated_investment' => 'Low — HVO is drop-in replacement for diesel',
            ];
        }

        if ($dieselPct > 50) {
            $recommendations[] = [
                'category' => 'fuel_transition',
                'priority' => 'medium',
                'title' => 'Consider LNG for long-haul routes',
                'description' => 'LNG trucks reduce CO₂ by ~15% vs diesel on routes >500 km with refuelling infrastructure.',
                'potential_reduction_pct' => 15,
                'estimated_investment' => 'Medium — new vehicles + LNG stations',
            ];
        }

        // Load factor
        $avgLoadFactor = CarbonFootprint::where('company_id', $companyId)
            ->whereNotNull('load_factor_pct')
            ->avg('load_factor_pct');

        if ($avgLoadFactor && $avgLoadFactor < 55) {
            $recommendations[] = [
                'category' => 'operational',
                'priority' => 'high',
                'title' => 'Improve load consolidation',
                'description' => "Average load factor is {$avgLoadFactor}%. Improving to 70% could reduce per-ton-km emissions by ~21%.",
                'potential_reduction_pct' => 21,
                'estimated_investment' => 'Low — TMS optimization',
            ];
        }

        // Modal shift
        $longHaulCount = DB::table('carbon_footprints')
            ->where('company_id', $companyId)
            ->where('distance_km', '>', 500)
            ->count();

        if ($longHaulCount > 10) {
            $recommendations[] = [
                'category' => 'modal_shift',
                'priority' => 'medium',
                'title' => 'Shift long-haul to rail or intermodal',
                'description' => "You have {$longHaulCount} routes >500 km. Rail/intermodal could reduce emissions by 60-80% on these corridors.",
                'potential_reduction_pct' => 65,
                'estimated_investment' => 'Medium — intermodal partnerships',
            ];
        }

        // Carbon offsetting
        $offsetPct = CarbonFootprint::where('company_id', $companyId)
            ->where('is_carbon_neutral', true)->count();
        $totalShipments = CarbonFootprint::where('company_id', $companyId)->count();

        if ($totalShipments > 0 && ($offsetPct / $totalShipments) < 0.5) {
            $recommendations[] = [
                'category' => 'offsetting',
                'priority' => 'low',
                'title' => 'Increase carbon offset coverage',
                'description' => 'Only ' . round(($offsetPct / $totalShipments) * 100) . '% of shipments are carbon-neutral. Consider voluntary offsets for remaining.',
                'potential_reduction_pct' => 100,
                'estimated_investment' => 'Low — ~€25-30 per ton CO₂',
            ];
        }

        // Eco-driving
        if ($avgCo2PerKm > 0.80) {
            $recommendations[] = [
                'category' => 'driver_behaviour',
                'priority' => 'medium',
                'title' => 'Eco-driving training programme',
                'description' => 'CO₂/km is above average. Eco-driving training can reduce fuel consumption by 5-15%.',
                'potential_reduction_pct' => 10,
                'estimated_investment' => 'Low — training cost',
            ];
        }

        // Electric last-mile
        $shortHaulCount = DB::table('carbon_footprints')
            ->where('company_id', $companyId)
            ->where('distance_km', '<', 150)
            ->count();

        if ($shortHaulCount > 20) {
            $recommendations[] = [
                'category' => 'electrification',
                'priority' => 'high',
                'title' => 'Electric vehicles for short-haul / last-mile',
                'description' => "{$shortHaulCount} routes under 150 km are suitable for electric trucks, eliminating direct emissions.",
                'potential_reduction_pct' => 95,
                'estimated_investment' => 'High — new EV fleet + charging',
            ];
        }

        // Sort by priority
        $priorityOrder = ['high' => 0, 'medium' => 1, 'low' => 2];
        usort($recommendations, fn($a, $b) => ($priorityOrder[$a['priority']] ?? 9) <=> ($priorityOrder[$b['priority']] ?? 9));

        return $recommendations;
    }

    // ── Scope Breakdown (GHG Protocol) ──────────────────────────

    private function getScopeBreakdown(float $ttwKg, float $wttKg, string $mode): array
    {
        // Scope 1: Direct emissions from owned vehicles
        // Scope 2: Indirect from purchased energy (electricity, heat)
        // Scope 3: Value-chain (upstream fuel, subcontractors, etc.)

        if ($mode === 'road') {
            return [
                'scope_1_kg' => round($ttwKg, 3),        // Direct combustion
                'scope_2_kg' => 0,                        // Unless electric
                'scope_3_kg' => round($wttKg, 3),        // Upstream fuel production
                'note' => 'For owned fleet. Subcontracted = all Scope 3.',
            ];
        }

        // Rail (electric) — Scope 2
        if ($mode === 'rail') {
            return [
                'scope_1_kg' => round($ttwKg, 3),
                'scope_2_kg' => round($wttKg * 0.6, 3),  // Electricity generation
                'scope_3_kg' => round($wttKg * 0.4, 3),  // Upstream
                'note' => 'Rail transport usually Scope 3 for shipper.',
            ];
        }

        return [
            'scope_1_kg' => 0,
            'scope_2_kg' => 0,
            'scope_3_kg' => round($ttwKg + $wttKg, 3),
            'note' => 'Third-party transport = Scope 3 for shipper.',
        ];
    }

    // ─── Helpers ────────────────────────────────────────────────

    private function getWtwFactors(string $mode, ?string $vehicleType, string $fuelType): array
    {
        if ($mode === 'road') {
            $vt = $vehicleType ?? 'standard_truck';
            if (isset(self::ROAD_FACTORS[$vt][$fuelType])) {
                [$ttw, $wtt, $wtw] = self::ROAD_FACTORS[$vt][$fuelType];
                return ['ttw' => $ttw, 'wtt' => $wtt, 'wtw' => $wtw];
            }
            // Fallback to diesel
            if (isset(self::ROAD_FACTORS[$vt]['diesel'])) {
                [$ttw, $wtt, $wtw] = self::ROAD_FACTORS[$vt]['diesel'];
                return ['ttw' => $ttw, 'wtt' => $wtt, 'wtw' => $wtw];
            }
            return ['ttw' => 0.062, 'wtt' => 0.012, 'wtw' => 0.074];
        }

        // Non-road modes
        if (isset(self::MODE_FACTORS[$mode][$fuelType])) {
            return self::MODE_FACTORS[$mode][$fuelType];
        }
        if (isset(self::MODE_FACTORS[$mode]['default'])) {
            return self::MODE_FACTORS[$mode]['default'];
        }

        return ['ttw' => 0.062, 'wtt' => 0.012, 'wtw' => 0.074];
    }

    private function generateModeRecommendation(array $comparisons, float $distanceKm): string
    {
        if ($distanceKm < 150) {
            return 'For distances under 150 km, electric trucks offer the lowest emissions. Consider EV or HVO-fueled trucks for last-mile delivery.';
        }

        if ($distanceKm > 500) {
            return 'For distances over 500 km, rail freight or intermodal (truck + rail) typically offers 60-80% lower emissions vs all-road. Check corridor availability.';
        }

        return 'For medium distances (150-500 km), LNG or HVO-fueled trucks are optimal. Where rail connections exist, intermodal can reduce emissions by up to 65%.';
    }
}
