<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InsuranceQuote extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transport_order_id', 'company_id', 'requested_by',
        'provider_name', 'cargo_value', 'cargo_value_currency',
        'premium_amount', 'premium_currency', 'coverage_type',
        'coverage_details', 'exclusions', 'deductible', 'policy_number',
        'status', 'valid_until', 'accepted_at',
    ];

    protected $casts = [
        'cargo_value' => 'decimal:2',
        'premium_amount' => 'decimal:2',
        'deductible' => 'decimal:2',
        'coverage_details' => 'array',
        'exclusions' => 'array',
        'valid_until' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public function transportOrder() { return $this->belongsTo(TransportOrder::class); }
    public function company() { return $this->belongsTo(Company::class); }
    public function requestedBy() { return $this->belongsTo(User::class, 'requested_by'); }

    public function scopeActive($q) { return $q->where('status', 'active'); }
    public function scopeQuoted($q) { return $q->where('status', 'quoted'); }

    public function isValid(): bool
    {
        return $this->status === 'quoted' && $this->valid_until?->isFuture();
    }

    /**
     * Calculate insurance premium based on cargo value and risk factors.
     */
    public static function calculatePremium(
        float $cargoValue,
        string $coverageType = 'basic',
        string $cargoType = 'general',
        float $distanceKm = 500,
        bool $isHazardous = false
    ): array {
        // Base premium rates (% of cargo value)
        $baseRates = [
            'basic' => 0.0015,      // 0.15%
            'all_risk' => 0.0035,   // 0.35%
            'extended' => 0.0055,   // 0.55%
        ];

        $rate = $baseRates[$coverageType] ?? 0.0035;

        // Distance adjustment
        if ($distanceKm > 2000) $rate *= 1.3;
        elseif ($distanceKm > 1000) $rate *= 1.15;

        // Hazardous goods surcharge
        if ($isHazardous) $rate *= 1.5;

        // Cargo type adjustments
        $cargoMultipliers = [
            'electronics' => 1.4,
            'pharmaceuticals' => 1.3,
            'art_antiques' => 1.6,
            'perishable' => 1.25,
            'machinery' => 1.1,
            'general' => 1.0,
            'raw_materials' => 0.9,
        ];
        $rate *= $cargoMultipliers[$cargoType] ?? 1.0;

        $premium = round($cargoValue * $rate, 2);
        $minPremium = 25.0; // minimum €25

        return [
            'premium_amount' => max($premium, $minPremium),
            'rate_pct' => round($rate * 100, 4),
            'deductible' => round($cargoValue * 0.01, 2), // 1% deductible
            'coverage_type' => $coverageType,
        ];
    }
}
