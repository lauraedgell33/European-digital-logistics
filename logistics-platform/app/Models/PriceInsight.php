<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PriceInsight extends Model
{
    protected $fillable = [
        'origin_country', 'origin_city', 'destination_country', 'destination_city',
        'vehicle_type', 'period_date', 'period_type',
        'sample_count', 'avg_price', 'min_price', 'max_price', 'median_price',
        'avg_price_per_km', 'avg_distance_km', 'currency',
    ];

    protected $casts = [
        'period_date' => 'date',
        'avg_price' => 'decimal:2',
        'min_price' => 'decimal:2',
        'max_price' => 'decimal:2',
        'median_price' => 'decimal:2',
        'avg_price_per_km' => 'decimal:4',
        'avg_distance_km' => 'decimal:2',
    ];

    public function scopeForRoute($q, $originCC, $destCC, $originCity = null, $destCity = null)
    {
        $q->where('origin_country', $originCC)->where('destination_country', $destCC);
        if ($originCity) $q->where('origin_city', $originCity);
        if ($destCity) $q->where('destination_city', $destCity);
        return $q;
    }

    public function scopeForVehicleType($q, $type) { return $q->where('vehicle_type', $type); }
    public function scopeWeekly($q) { return $q->where('period_type', 'weekly'); }
    public function scopeMonthly($q) { return $q->where('period_type', 'monthly'); }
}
