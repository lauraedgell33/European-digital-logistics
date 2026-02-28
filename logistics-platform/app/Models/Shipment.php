<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Shipment extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'current_lat', 'current_lng', 'current_location_name', 'eta'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Shipment {$eventName}")
            ->useLogName('shipments');
    }

    protected $fillable = [
        'transport_order_id', 'tracking_code',
        'current_lat', 'current_lng', 'current_location_name',
        'eta', 'status', 'tracking_device_id',
        'speed_kmh', 'heading', 'temperature', 'battery_level',
        'last_update', 'route_waypoints',
        'total_distance_km', 'remaining_distance_km', 'notes',
    ];

    protected $casts = [
        'current_lat' => 'decimal:8',
        'current_lng' => 'decimal:8',
        'speed_kmh' => 'decimal:2',
        'heading' => 'decimal:2',
        'temperature' => 'decimal:2',
        'eta' => 'datetime',
        'last_update' => 'datetime',
        'route_waypoints' => 'array',
        'status' => \App\Enums\ShipmentStatus::class,
    ];

    // ── Boot ──────────────────────────────────────────────
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($shipment) {
            if (!$shipment->tracking_code) {
                $shipment->tracking_code = 'TRK-' . strtoupper(bin2hex(random_bytes(8)));
            }
        });
    }

    // ── Relationships ─────────────────────────────────────
    public function transportOrder(): BelongsTo
    {
        return $this->belongsTo(TransportOrder::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(ShipmentEvent::class)->orderBy('occurred_at', 'desc');
    }

    public function positions(): HasMany
    {
        return $this->hasMany(TrackingPosition::class)->orderBy('recorded_at', 'desc');
    }

    // ── Scopes ────────────────────────────────────────────
    public function scopeInTransit($query)
    {
        return $query->where('status', 'in_transit');
    }

    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    // ── Helpers ───────────────────────────────────────────
    public function updatePosition(float $lat, float $lng, array $extras = []): void
    {
        $this->update(array_merge([
            'current_lat' => $lat,
            'current_lng' => $lng,
            'last_update' => now(),
        ], $extras));

        TrackingPosition::create([
            'shipment_id' => $this->id,
            'lat' => $lat,
            'lng' => $lng,
            'speed_kmh' => $extras['speed_kmh'] ?? null,
            'heading' => $extras['heading'] ?? null,
            'temperature' => $extras['temperature'] ?? null,
            'recorded_at' => now(),
        ]);
    }

    public function addEvent(string $type, string $description = null, array $metadata = []): ShipmentEvent
    {
        return $this->events()->create([
            'event_type' => $type,
            'description' => $description,
            'lat' => $this->current_lat,
            'lng' => $this->current_lng,
            'location_name' => $this->current_location_name,
            'metadata' => $metadata,
            'occurred_at' => now(),
        ]);
    }

    public function isDelayed(): bool
    {
        return $this->eta && $this->eta->isPast() && $this->status !== 'delivered';
    }
}
