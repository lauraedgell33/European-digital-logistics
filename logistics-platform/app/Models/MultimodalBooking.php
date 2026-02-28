<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MultimodalBooking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'user_id', 'transport_order_id', 'booking_reference',
        'transport_mode', 'carrier_name', 'service_type',
        'origin_terminal', 'origin_country', 'origin_city',
        'destination_terminal', 'destination_country', 'destination_city',
        'departure_date', 'estimated_arrival', 'actual_departure', 'actual_arrival',
        'transit_time_hours', 'cargo_type', 'weight_kg', 'volume_m3',
        'container_count', 'container_type', 'wagon_type',
        'is_hazardous', 'requires_temperature_control',
        'price', 'currency', 'price_breakdown',
        'status', 'tracking_data', 'notes',
    ];

    protected $casts = [
        'price_breakdown' => 'array',
        'tracking_data' => 'array',
        'departure_date' => 'datetime',
        'estimated_arrival' => 'datetime',
        'actual_departure' => 'datetime',
        'actual_arrival' => 'datetime',
        'price' => 'decimal:2',
        'weight_kg' => 'decimal:2',
        'volume_m3' => 'decimal:2',
        'is_hazardous' => 'boolean',
        'requires_temperature_control' => 'boolean',
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

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['cancelled']);
    }

    public function scopeOfMode($query, string $mode)
    {
        return $query->where('transport_mode', $mode);
    }

    public static function generateReference(): string
    {
        return 'MMB-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
    }

    public function isDelayed(): bool
    {
        return $this->actual_arrival && $this->estimated_arrival
            && $this->actual_arrival->gt($this->estimated_arrival);
    }
}
