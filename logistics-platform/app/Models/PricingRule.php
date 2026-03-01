<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'rule_type',
        'origin_country',
        'destination_country',
        'vehicle_type',
        'cargo_type',
        'value',
        'value_type',
        'conditions',
        'priority',
        'is_active',
        'valid_from',
        'valid_until',
    ];

    protected $casts = [
        'value' => 'decimal:4',
        'conditions' => 'array',
        'priority' => 'integer',
        'is_active' => 'boolean',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
    ];

    // ── Rule Types ──────────────────────────────────────────────

    public const TYPE_BASE_RATE = 'base_rate';           // per-km base
    public const TYPE_SURCHARGE = 'surcharge';            // additive surcharge
    public const TYPE_MULTIPLIER = 'multiplier';          // multiplicative factor
    public const TYPE_DISCOUNT = 'discount';              // percentage discount
    public const TYPE_MINIMUM = 'minimum';                // minimum price floor
    public const TYPE_MAXIMUM = 'maximum';                // maximum price ceiling
    public const TYPE_FUEL_SURCHARGE = 'fuel_surcharge';  // fuel index link
    public const TYPE_SEASONAL = 'seasonal';              // seasonal adjustments

    // ── Scopes ──────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', now());
            });
    }

    public function scopeForRoute($query, string $origin, string $destination)
    {
        return $query->where(function ($q) use ($origin) {
            $q->where('origin_country', $origin)
                ->orWhereNull('origin_country');
        })->where(function ($q) use ($destination) {
            $q->where('destination_country', $destination)
                ->orWhereNull('destination_country');
        });
    }

    public function scopeForVehicle($query, ?string $vehicleType)
    {
        return $query->where(function ($q) use ($vehicleType) {
            $q->where('vehicle_type', $vehicleType)
                ->orWhereNull('vehicle_type');
        });
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('rule_type', $type);
    }

    // ── Helpers ─────────────────────────────────────────────────

    /**
     * Check if this rule matches specific shipment conditions.
     */
    public function matchesConditions(array $shipment): bool
    {
        if (empty($this->conditions)) {
            return true;
        }

        foreach ($this->conditions as $key => $constraint) {
            $shipmentValue = $shipment[$key] ?? null;

            if ($shipmentValue === null) {
                continue; // skip conditions we can't evaluate
            }

            if (is_array($constraint)) {
                // Range check: {"min": 1000, "max": 5000}
                if (isset($constraint['min']) && $shipmentValue < $constraint['min']) return false;
                if (isset($constraint['max']) && $shipmentValue > $constraint['max']) return false;
                // In-list check: {"in": ["DE", "FR", "NL"]}
                if (isset($constraint['in']) && !in_array($shipmentValue, $constraint['in'])) return false;
            } else {
                // Exact match
                if ($shipmentValue != $constraint) return false;
            }
        }

        return true;
    }

    /**
     * Apply this rule to a price.
     */
    public function applyToPrice(float $currentPrice, float $distanceKm = 0): float
    {
        return match ($this->rule_type) {
            self::TYPE_BASE_RATE => $this->value * $distanceKm,
            self::TYPE_SURCHARGE => $this->value_type === 'percentage'
                ? $currentPrice * (1 + $this->value / 100)
                : $currentPrice + $this->value,
            self::TYPE_MULTIPLIER => $currentPrice * $this->value,
            self::TYPE_DISCOUNT => $this->value_type === 'percentage'
                ? $currentPrice * (1 - $this->value / 100)
                : $currentPrice - $this->value,
            self::TYPE_MINIMUM => max($currentPrice, $this->value),
            self::TYPE_MAXIMUM => min($currentPrice, $this->value),
            self::TYPE_FUEL_SURCHARGE => $currentPrice * (1 + $this->value / 100),
            self::TYPE_SEASONAL => $currentPrice * $this->value,
            default => $currentPrice,
        };
    }
}
