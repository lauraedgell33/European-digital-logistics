<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarbonFootprint extends Model
{
    protected $fillable = [
        'transport_order_id', 'company_id',
        'co2_kg', 'co2_per_km', 'co2_per_ton_km',
        'distance_km', 'weight_kg', 'vehicle_type', 'fuel_type', 'emission_standard', 'load_factor_pct',
        'industry_avg_co2_kg', 'savings_vs_avg_pct',
        'offset_purchased_kg', 'offset_cost', 'offset_currency', 'is_carbon_neutral',
    ];

    protected $casts = [
        'co2_kg' => 'decimal:2',
        'co2_per_km' => 'decimal:4',
        'co2_per_ton_km' => 'decimal:4',
        'distance_km' => 'decimal:2',
        'weight_kg' => 'decimal:2',
        'load_factor_pct' => 'decimal:2',
        'industry_avg_co2_kg' => 'decimal:2',
        'savings_vs_avg_pct' => 'decimal:2',
        'offset_purchased_kg' => 'decimal:2',
        'offset_cost' => 'decimal:2',
        'is_carbon_neutral' => 'boolean',
    ];

    public function transportOrder() { return $this->belongsTo(TransportOrder::class); }
    public function company() { return $this->belongsTo(Company::class); }

    /**
     * CO₂ emission factors in kg CO₂ per km for different vehicle & fuel combos.
     * Based on EN 16258 / GLEC Framework.
     */
    public static function getEmissionFactor(string $vehicleType, string $fuelType = 'diesel', string $emissionStandard = null): float
    {
        // Base factors kg CO₂/km (full truck, average load factor 60%)
        $baseFactors = [
            'van' => 0.21,
            'box_truck' => 0.45,
            'standard_truck' => 0.85,
            'curtainsider' => 0.85,
            'mega_trailer' => 0.90,
            'refrigerated' => 1.10,
            'tanker' => 0.95,
            'flatbed' => 0.88,
            'container' => 0.92,
        ];

        $base = $baseFactors[$vehicleType] ?? 0.85;

        // Fuel type multiplier
        $fuelMultipliers = [
            'diesel' => 1.0,
            'lng' => 0.85,    // ~15% reduction
            'cng' => 0.80,    // ~20% reduction
            'hvo' => 0.10,    // ~90% reduction (renewable diesel)
            'electric' => 0.0, // zero direct emissions
            'hybrid' => 0.70,  // ~30% reduction
            'hydrogen' => 0.0, // zero direct
        ];

        $fuelMult = $fuelMultipliers[$fuelType] ?? 1.0;

        // Emission standard adjustment
        $standardMultipliers = [
            'euro_3' => 1.15,
            'euro_4' => 1.08,
            'euro_5' => 1.03,
            'euro_6' => 1.0,
            'euro_6d' => 0.97,
        ];

        $standardMult = $standardMultipliers[$emissionStandard] ?? 1.0;

        return round($base * $fuelMult * $standardMult, 4);
    }

    /**
     * Calculate CO₂ for a transport.
     */
    public static function calculate(
        float $distanceKm,
        string $vehicleType,
        string $fuelType = 'diesel',
        ?float $weightKg = null,
        ?float $loadFactor = null,
        ?string $emissionStandard = null
    ): array {
        $factor = self::getEmissionFactor($vehicleType, $fuelType, $emissionStandard);

        // Adjust for load factor (0-100%)
        $loadAdj = 1.0;
        if ($loadFactor !== null && $loadFactor > 0) {
            // Lower load factor → higher per-ton emissions
            $loadAdj = 60 / max($loadFactor, 10); // normalized to 60% default
        }

        $co2Kg = round($distanceKm * $factor * $loadAdj, 2);
        $co2PerKm = round($factor * $loadAdj, 4);
        $co2PerTonKm = null;

        if ($weightKg && $weightKg > 0) {
            $co2PerTonKm = round(($co2Kg / ($weightKg / 1000)) / $distanceKm, 4);
        }

        // Industry average (diesel standard truck, 60% load)
        $industryAvg = round($distanceKm * 0.85, 2);
        $savingsPct = $industryAvg > 0
            ? round((($industryAvg - $co2Kg) / $industryAvg) * 100, 2)
            : 0;

        // Carbon offset cost (~25€ per ton CO₂)
        $offsetCostPerTon = 25.0;
        $offsetCost = round(($co2Kg / 1000) * $offsetCostPerTon, 2);

        return [
            'co2_kg' => $co2Kg,
            'co2_per_km' => $co2PerKm,
            'co2_per_ton_km' => $co2PerTonKm,
            'industry_avg_co2_kg' => $industryAvg,
            'savings_vs_avg_pct' => $savingsPct,
            'offset_cost_eur' => $offsetCost,
            'emission_factor' => $factor,
            'fuel_type' => $fuelType,
            'vehicle_type' => $vehicleType,
            'distance_km' => $distanceKm,
        ];
    }
}
