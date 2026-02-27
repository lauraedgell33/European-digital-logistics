<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    protected $fillable = [
        'origin_country', 'origin_city', 'origin_lat', 'origin_lng',
        'destination_country', 'destination_city', 'destination_lat', 'destination_lng',
        'distance_km', 'duration_minutes', 'waypoints',
        'toll_costs', 'fuel_cost_estimate', 'currency', 'country_crossings',
    ];

    protected $casts = [
        'origin_lat' => 'decimal:8',
        'origin_lng' => 'decimal:8',
        'destination_lat' => 'decimal:8',
        'destination_lng' => 'decimal:8',
        'waypoints' => 'array',
        'toll_costs' => 'array',
        'fuel_cost_estimate' => 'decimal:2',
        'country_crossings' => 'array',
    ];

    public function getDurationFormatted(): string
    {
        $hours = intdiv($this->duration_minutes, 60);
        $minutes = $this->duration_minutes % 60;
        return "{$hours}h {$minutes}m";
    }

    public function getTotalCost(): float
    {
        $tollTotal = collect($this->toll_costs ?? [])->sum('cost');
        return $tollTotal + ($this->fuel_cost_estimate ?? 0);
    }
}
