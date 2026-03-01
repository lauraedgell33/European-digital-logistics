<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;

class VehicleOffer extends Model
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
            'vehicle_type' => $this->vehicle_type,
            'vehicle_registration' => $this->vehicle_registration,
            'capacity_kg' => (float) $this->capacity_kg,
            'capacity_m3' => (float) $this->capacity_m3,
            'loading_meters' => (float) $this->loading_meters,
            'pallet_spaces' => $this->pallet_spaces,
            'equipment' => $this->equipment,
            'has_adr' => $this->has_adr,
            'has_temperature_control' => $this->has_temperature_control,
            'current_country' => $this->current_country,
            'current_city' => $this->current_city,
            'current_postal_code' => $this->current_postal_code,
            'current_location' => ($this->current_lat && $this->current_lng)
                ? ['lat' => (float) $this->current_lat, 'lon' => (float) $this->current_lng]
                : null,
            'destination_country' => $this->destination_country,
            'destination_city' => $this->destination_city,
            'available_from' => $this->available_from?->format('Y-m-d'),
            'available_to' => $this->available_to?->format('Y-m-d'),
            'price_per_km' => (float) $this->price_per_km,
            'flat_price' => (float) $this->flat_price,
            'currency' => $this->currency,
            'status' => $this->status,
            'is_public' => $this->is_public,
            'driver_name' => $this->driver_name,
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
        return in_array($this->status, ['available', 'in_transit']);
    }

    protected $fillable = [
        'company_id', 'user_id',
        'vehicle_type', 'vehicle_registration', 'capacity_kg', 'capacity_m3',
        'loading_meters', 'pallet_spaces', 'equipment',
        'has_adr', 'has_temperature_control', 'min_temperature', 'max_temperature',
        'current_country', 'current_city', 'current_postal_code', 'current_lat', 'current_lng',
        'destination_country', 'destination_city',
        'available_from', 'available_to',
        'price_per_km', 'flat_price', 'currency',
        'status', 'is_public', 'network_id',
        'driver_name', 'driver_phone',
        'notes', 'expires_at',
    ];

    protected $casts = [
        'capacity_kg' => 'decimal:2',
        'capacity_m3' => 'decimal:2',
        'price_per_km' => 'decimal:2',
        'flat_price' => 'decimal:2',
        'current_lat' => 'decimal:8',
        'current_lng' => 'decimal:8',
        'min_temperature' => 'decimal:2',
        'max_temperature' => 'decimal:2',
        'equipment' => 'array',
        'has_adr' => 'boolean',
        'has_temperature_control' => 'boolean',
        'is_public' => 'boolean',
        'available_from' => 'date',
        'available_to' => 'date',
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

    // ── Scopes ────────────────────────────────────────────
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeInCountry($query, string $countryCode)
    {
        return $query->where('current_country', $countryCode);
    }

    public function scopeInCity($query, string $city)
    {
        return $query->where('current_city', $city);
    }

    public function scopeAvailableFrom($query, $date)
    {
        return $query->where('available_from', '<=', $date);
    }

    public function scopeWithVehicleType($query, string $vehicleType)
    {
        return $query->where('vehicle_type', $vehicleType);
    }

    public function scopeWithMinCapacity($query, float $minKg)
    {
        return $query->where('capacity_kg', '>=', $minKg);
    }

    public function scopeWithAdr($query)
    {
        return $query->where('has_adr', true);
    }

    public function scopeWithTemperatureControl($query)
    {
        return $query->where('has_temperature_control', true);
    }

    // ── Helpers ───────────────────────────────────────────
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function getCurrentLocation(): string
    {
        return "{$this->current_city}, {$this->current_country}";
    }
}
