<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IntermodalPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'user_id', 'transport_order_id', 'plan_reference',
        'origin_address', 'origin_country', 'origin_city', 'origin_lat', 'origin_lng',
        'destination_address', 'destination_country', 'destination_city', 'destination_lat', 'destination_lng',
        'legs', 'total_legs', 'total_distance_km', 'total_duration_hours',
        'total_cost', 'total_co2_kg', 'currency',
        'weight_kg', 'volume_m3', 'cargo_type',
        'road_only_cost', 'road_only_co2_kg',
        'cost_savings_pct', 'co2_savings_pct',
        'alternative_plans', 'status', 'optimization_priority',
    ];

    protected $casts = [
        'legs' => 'array',
        'alternative_plans' => 'array',
        'origin_lat' => 'decimal:8',
        'origin_lng' => 'decimal:8',
        'destination_lat' => 'decimal:8',
        'destination_lng' => 'decimal:8',
        'total_distance_km' => 'decimal:2',
        'total_duration_hours' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'total_co2_kg' => 'decimal:2',
        'weight_kg' => 'decimal:2',
        'volume_m3' => 'decimal:2',
        'road_only_cost' => 'decimal:2',
        'road_only_co2_kg' => 'decimal:2',
        'cost_savings_pct' => 'decimal:2',
        'co2_savings_pct' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transportOrder(): BelongsTo
    {
        return $this->belongsTo(TransportOrder::class);
    }

    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    public function getModesUsedAttribute(): array
    {
        return array_unique(array_column($this->legs ?? [], 'mode'));
    }
}
