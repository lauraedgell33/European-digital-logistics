<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteOptimization extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'user_id', 'optimization_type',
        'waypoints', 'constraints', 'optimized_route',
        'original_distance_km', 'optimized_distance_km',
        'distance_saved_km', 'distance_saved_pct',
        'original_duration_hours', 'optimized_duration_hours',
        'time_saved_hours', 'estimated_co2_saved_kg', 'estimated_cost_saved_eur',
        'alternative_routes', 'warnings', 'status',
    ];

    protected $casts = [
        'waypoints' => 'array',
        'constraints' => 'array',
        'optimized_route' => 'array',
        'alternative_routes' => 'array',
        'warnings' => 'array',
        'original_distance_km' => 'decimal:2',
        'optimized_distance_km' => 'decimal:2',
        'distance_saved_km' => 'decimal:2',
        'distance_saved_pct' => 'decimal:2',
        'original_duration_hours' => 'decimal:2',
        'optimized_duration_hours' => 'decimal:2',
        'time_saved_hours' => 'decimal:2',
        'estimated_co2_saved_kg' => 'decimal:2',
        'estimated_cost_saved_eur' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
