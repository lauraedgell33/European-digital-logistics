<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class TransportOrder extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'payment_status', 'total_price', 'pickup_date', 'delivery_date'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Order {$this->order_number} was {$eventName}")
            ->useLogName('orders');
    }

    protected $fillable = [
        'order_number', 'freight_offer_id', 'vehicle_offer_id',
        'shipper_id', 'carrier_id', 'created_by',
        'pickup_country', 'pickup_city', 'pickup_address', 'pickup_postal_code',
        'pickup_contact_name', 'pickup_contact_phone',
        'pickup_date', 'pickup_time_from', 'pickup_time_to',
        'delivery_country', 'delivery_city', 'delivery_address', 'delivery_postal_code',
        'delivery_contact_name', 'delivery_contact_phone',
        'delivery_date', 'delivery_time_from', 'delivery_time_to',
        'cargo_type', 'cargo_description', 'weight', 'volume', 'pallet_count',
        'total_price', 'currency', 'payment_terms', 'payment_status',
        'status', 'documents', 'special_instructions',
        'accepted_at', 'picked_up_at', 'delivered_at', 'completed_at',
        'cancelled_at', 'cancellation_reason',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'volume' => 'decimal:2',
        'total_price' => 'decimal:2',
        'documents' => 'array',
        'pickup_date' => 'datetime',
        'delivery_date' => 'datetime',
        'accepted_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'delivered_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    // ── Boot ──────────────────────────────────────────────
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (!$order->order_number) {
                $order->order_number = 'TO-' . date('Y') . '-' . str_pad(
                    static::withTrashed()->count() + 1,
                    6,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }

    // ── Relationships ─────────────────────────────────────
    public function freightOffer(): BelongsTo
    {
        return $this->belongsTo(FreightOffer::class);
    }

    public function vehicleOffer(): BelongsTo
    {
        return $this->belongsTo(VehicleOffer::class);
    }

    public function shipper(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'shipper_id');
    }

    public function carrier(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'carrier_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    // ── Media Collections ─────────────────────────────────
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cmr')
            ->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png']);

        $this->addMediaCollection('pod')
            ->singleFile()
            ->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png']);

        $this->addMediaCollection('invoices')
            ->acceptsMimeTypes(['application/pdf']);

        $this->addMediaCollection('documents')
            ->acceptsMimeTypes([
                'application/pdf',
                'image/jpeg',
                'image/png',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]);
    }

    // ── Scopes ────────────────────────────────────────────
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where(function ($q) use ($companyId) {
            $q->where('shipper_id', $companyId)
              ->orWhere('carrier_id', $companyId);
        });
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['accepted', 'pickup_scheduled', 'picked_up', 'in_transit']);
    }

    // ── State Transitions ─────────────────────────────────
    public function accept(): bool
    {
        if ($this->status !== 'pending') return false;
        $this->update(['status' => 'accepted', 'accepted_at' => now()]);
        return true;
    }

    public function reject(): bool
    {
        if ($this->status !== 'pending') return false;
        $this->update(['status' => 'rejected']);
        return true;
    }

    public function markPickedUp(): bool
    {
        if (!in_array($this->status, ['accepted', 'pickup_scheduled'])) return false;
        $this->update(['status' => 'picked_up', 'picked_up_at' => now()]);
        return true;
    }

    public function markInTransit(): bool
    {
        if ($this->status !== 'picked_up') return false;
        $this->update(['status' => 'in_transit']);
        return true;
    }

    public function markDelivered(): bool
    {
        if ($this->status !== 'in_transit') return false;
        $this->update(['status' => 'delivered', 'delivered_at' => now()]);
        return true;
    }

    public function complete(): bool
    {
        if ($this->status !== 'delivered') return false;
        $this->update(['status' => 'completed', 'completed_at' => now()]);
        return true;
    }

    public function cancel(string $reason = null): bool
    {
        if (in_array($this->status, ['delivered', 'completed', 'cancelled'])) return false;
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);
        return true;
    }
}
