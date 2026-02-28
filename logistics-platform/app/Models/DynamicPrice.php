<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DynamicPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'origin_country', 'origin_city', 'destination_country', 'destination_city',
        'vehicle_type', 'base_price_per_km', 'dynamic_price_per_km',
        'surge_multiplier', 'demand_index', 'supply_index',
        'fuel_surcharge_pct', 'seasonal_factor', 'weather_factor',
        'price_components', 'valid_from', 'valid_until', 'currency',
    ];

    protected $casts = [
        'base_price_per_km' => 'decimal:4',
        'dynamic_price_per_km' => 'decimal:4',
        'surge_multiplier' => 'decimal:2',
        'demand_index' => 'decimal:2',
        'supply_index' => 'decimal:2',
        'fuel_surcharge_pct' => 'decimal:2',
        'seasonal_factor' => 'decimal:2',
        'weather_factor' => 'decimal:2',
        'price_components' => 'array',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('valid_from', '<=', now())->where('valid_until', '>=', now());
    }

    public function scopeForRoute($query, string $origin, string $destination)
    {
        return $query->where('origin_country', $origin)->where('destination_country', $destination);
    }

    public function getPriceChangeAttribute(): float
    {
        if ($this->base_price_per_km <= 0) return 0;
        return round((($this->dynamic_price_per_km - $this->base_price_per_km) / $this->base_price_per_km) * 100, 2);
    }
}
