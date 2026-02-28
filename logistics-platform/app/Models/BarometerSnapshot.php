<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarometerSnapshot extends Model
{
    protected $fillable = [
        'origin_country', 'destination_country', 'snapshot_date', 'period',
        'freight_offers_count', 'vehicle_offers_count', 'freight_to_vehicle_ratio',
        'avg_price_per_km', 'min_price_per_km', 'max_price_per_km', 'median_price_per_km',
        'avg_weight_kg', 'total_weight_kg', 'completed_orders_count',
        'vehicle_type_breakdown', 'cargo_type_breakdown',
        'price_change_pct', 'demand_change_pct',
    ];

    protected $casts = [
        'snapshot_date' => 'date',
        'freight_to_vehicle_ratio' => 'decimal:4',
        'avg_price_per_km' => 'decimal:4',
        'min_price_per_km' => 'decimal:4',
        'max_price_per_km' => 'decimal:4',
        'median_price_per_km' => 'decimal:4',
        'avg_weight_kg' => 'decimal:2',
        'total_weight_kg' => 'decimal:2',
        'vehicle_type_breakdown' => 'array',
        'cargo_type_breakdown' => 'array',
        'price_change_pct' => 'decimal:2',
        'demand_change_pct' => 'decimal:2',
    ];

    // Scopes
    public function scopeForRoute($q, $origin, $dest)
    {
        return $q->where('origin_country', $origin)->where('destination_country', $dest);
    }

    public function scopeForCountry($q, $country)
    {
        return $q->where(function ($q2) use ($country) {
            $q2->where('origin_country', $country)->orWhere('destination_country', $country);
        });
    }

    public function scopeDaily($q) { return $q->where('period', 'daily'); }
    public function scopeWeekly($q) { return $q->where('period', 'weekly'); }
    public function scopeMonthly($q) { return $q->where('period', 'monthly'); }

    public function scopeDateRange($q, $from, $to)
    {
        return $q->whereBetween('snapshot_date', [$from, $to]);
    }
}
