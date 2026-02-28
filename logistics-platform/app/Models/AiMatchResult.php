<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiMatchResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'freight_offer_id', 'vehicle_offer_id', 'company_id',
        'ai_score', 'distance_score', 'capacity_score', 'timing_score',
        'reliability_score', 'price_score', 'carbon_score',
        'model_version', 'feature_weights', 'explanation',
        'status', 'accepted_at', 'rejected_at', 'rejection_reason',
    ];

    protected $casts = [
        'ai_score' => 'decimal:2',
        'distance_score' => 'decimal:2',
        'capacity_score' => 'decimal:2',
        'timing_score' => 'decimal:2',
        'reliability_score' => 'decimal:2',
        'price_score' => 'decimal:2',
        'carbon_score' => 'decimal:2',
        'feature_weights' => 'array',
        'explanation' => 'array',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function freightOffer(): BelongsTo
    {
        return $this->belongsTo(FreightOffer::class);
    }

    public function vehicleOffer(): BelongsTo
    {
        return $this->belongsTo(VehicleOffer::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeSuggested($query)
    {
        return $query->where('status', 'suggested');
    }

    public function scopeHighScore($query, float $minScore = 70)
    {
        return $query->where('ai_score', '>=', $minScore);
    }
}
