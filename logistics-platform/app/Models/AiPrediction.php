<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiPrediction extends Model
{
    use HasFactory;

    protected $fillable = [
        'prediction_type', 'origin_country', 'origin_city',
        'destination_country', 'destination_city', 'vehicle_type',
        'prediction_date', 'target_date',
        'predicted_value', 'confidence', 'lower_bound', 'upper_bound',
        'actual_value', 'accuracy_pct',
        'model_version', 'features_used', 'historical_data',
    ];

    protected $casts = [
        'predicted_value' => 'decimal:4',
        'confidence' => 'decimal:2',
        'lower_bound' => 'decimal:4',
        'upper_bound' => 'decimal:4',
        'actual_value' => 'decimal:4',
        'accuracy_pct' => 'decimal:2',
        'prediction_date' => 'date',
        'target_date' => 'date',
        'features_used' => 'array',
        'historical_data' => 'array',
    ];

    public function scopeForRoute($query, string $origin, string $destination)
    {
        return $query->where('origin_country', $origin)->where('destination_country', $destination);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('prediction_type', $type);
    }

    public function scopeHighConfidence($query, float $min = 70)
    {
        return $query->where('confidence', '>=', $min);
    }
}
