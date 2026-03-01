<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;

class FreightOffer extends Model
{
    use HasFactory, Searchable, SoftDeletes;

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'company_id' => $this->company_id,
            'user_id' => $this->user_id,
            'network_id' => $this->network_id,
            'origin_country' => $this->origin_country,
            'origin_city' => $this->origin_city,
            'origin_postal_code' => $this->origin_postal_code,
            'origin_location' => ($this->origin_lat && $this->origin_lng)
                ? ['lat' => (float) $this->origin_lat, 'lon' => (float) $this->origin_lng]
                : null,
            'origin_address' => $this->origin_address,
            'destination_country' => $this->destination_country,
            'destination_city' => $this->destination_city,
            'destination_postal_code' => $this->destination_postal_code,
            'destination_location' => ($this->destination_lat && $this->destination_lng)
                ? ['lat' => (float) $this->destination_lat, 'lon' => (float) $this->destination_lng]
                : null,
            'destination_address' => $this->destination_address,
            'cargo_type' => $this->cargo_type,
            'cargo_description' => $this->cargo_description,
            'weight' => (float) $this->weight,
            'volume' => (float) $this->volume,
            'loading_meters' => (float) $this->loading_meters,
            'pallet_count' => $this->pallet_count,
            'is_hazardous' => $this->is_hazardous,
            'adr_class' => $this->adr_class,
            'requires_temperature_control' => $this->requires_temperature_control,
            'vehicle_type' => $this->vehicle_type,
            'required_equipment' => $this->required_equipment,
            'loading_date' => $this->loading_date?->format('Y-m-d'),
            'unloading_date' => $this->unloading_date?->format('Y-m-d'),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'price' => (float) $this->price,
            'currency' => $this->currency,
            'price_type' => $this->price_type,
            'status' => $this->status,
            'is_public' => $this->is_public,
            'distance_km' => (float) $this->distance_km,
            'estimated_duration_hours' => (float) $this->estimated_duration_hours,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Determine if the model should be searchable.
     */
    public function shouldBeSearchable(): bool
    {
        return $this->status === 'active' && !$this->isExpired();
    }

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
