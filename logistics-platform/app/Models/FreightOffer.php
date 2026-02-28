<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FreightOffer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'user_id',
        'origin_country', 'origin_city', 'origin_postal_code', 'origin_lat', 'origin_lng', 'origin_address',
        'destination_country', 'destination_city', 'destination_postal_code', 'destination_lat', 'destination_lng', 'destination_address',
        'cargo_type', 'cargo_description', 'weight', 'volume', 'length', 'width', 'height',
        'loading_meters', 'pallet_count',
        'is_hazardous', 'adr_class', 'requires_temperature_control', 'min_temperature', 'max_temperature',
        'loading_date', 'loading_time_from', 'loading_time_to',
        'unloading_date', 'unloading_time_from', 'unloading_time_to',
        'vehicle_type', 'required_equipment',
        'price', 'currency', 'price_type',
        'status', 'is_public', 'network_id',
        'distance_km', 'estimated_duration_hours',
        'notes', 'expires_at',
    ];

    protected $casts = [
        'origin_lat' => 'decimal:8',
        'origin_lng' => 'decimal:8',
        'destination_lat' => 'decimal:8',
        'destination_lng' => 'decimal:8',
        'weight' => 'decimal:2',
        'volume' => 'decimal:2',
        'price' => 'decimal:2',
        'is_hazardous' => 'boolean',
        'requires_temperature_control' => 'boolean',
        'is_public' => 'boolean',
        'required_equipment' => 'array',
        'loading_date' => 'date',
        'unloading_date' => 'date',
        'expires_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function network(): BelongsTo
    {
        return $this->belongsTo(PartnerNetwork::class, 'network_id');
    }

    public function transportOrder()
    {
        return $this->hasOne(TransportOrder::class);
    }

    public function matchResults()
    {
        return $this->hasMany(AiMatchResult::class);
    }

    // ── Scopes ────────────────────────────────────────────
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeInNetwork($query, int $networkId)
    {
        return $query->where('network_id', $networkId);
    }

    public function scopeFromCountry($query, string $countryCode)
    {
        return $query->where('origin_country', $countryCode);
    }

    public function scopeToCountry($query, string $countryCode)
    {
        return $query->where('destination_country', $countryCode);
    }

    public function scopeLoadingBetween($query, $from, $to)
    {
        return $query->whereBetween('loading_date', [$from, $to]);
    }

    public function scopeWithVehicleType($query, string $vehicleType)
    {
        return $query->where('vehicle_type', $vehicleType);
    }

    public function scopeMaxWeight($query, float $maxWeight)
    {
        return $query->where('weight', '<=', $maxWeight);
    }

    // ── Helpers ───────────────────────────────────────────
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && !$this->isExpired();
    }

    public function getFullOrigin(): string
    {
        return "{$this->origin_city}, {$this->origin_postal_code}, {$this->origin_country}";
    }

    public function getFullDestination(): string
    {
        return "{$this->destination_city}, {$this->destination_postal_code}, {$this->destination_country}";
    }
}
