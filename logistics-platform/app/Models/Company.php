<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Company extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'verification_status', 'is_active', 'email', 'phone'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Company {$this->name} was {$eventName}")
            ->useLogName('companies');
    }

    protected $fillable = [
        'name',
        'vat_number',
        'registration_number',
        'type',
        'verification_status',
        'country_code',
        'address',
        'city',
        'postal_code',
        'phone',
        'email',
        'website',
        'logo',
        'documents',
        'rating',
        'total_reviews',
        'is_active',
        'verified_at',
    ];

    protected $casts = [
        'documents' => 'array',
        'rating' => 'decimal:2',
        'is_active' => 'boolean',
        'verified_at' => 'datetime',
        'verification_status' => \App\Enums\CompanyVerificationStatus::class,
    ];

    // ── Media Collections ─────────────────────────────────
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('logo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/svg+xml']);

        $this->addMediaCollection('documents')
            ->acceptsMimeTypes([
                'application/pdf',
                'image/jpeg',
                'image/png',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(200)
            ->height(200)
            ->performOnCollections('logo');
    }

    // ── Relationships ─────────────────────────────────────
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function freightOffers(): HasMany
    {
        return $this->hasMany(FreightOffer::class);
    }

    public function vehicleOffers(): HasMany
    {
        return $this->hasMany(VehicleOffer::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function transportOrdersAsShipper(): HasMany
    {
        return $this->hasMany(TransportOrder::class, 'shipper_id');
    }

    public function transportOrdersAsCarrier(): HasMany
    {
        return $this->hasMany(TransportOrder::class, 'carrier_id');
    }

    public function tenders(): HasMany
    {
        return $this->hasMany(Tender::class);
    }

    public function tenderBids(): HasMany
    {
        return $this->hasMany(TenderBid::class);
    }

    public function ownedNetworks(): HasMany
    {
        return $this->hasMany(PartnerNetwork::class, 'owner_company_id');
    }

    public function networks(): BelongsToMany
    {
        return $this->belongsToMany(PartnerNetwork::class, 'network_members', 'company_id', 'network_id')
            ->withPivot(['status', 'role', 'joined_at'])
            ->withTimestamps();
    }

    public function escrowPayments(): HasMany
    {
        return $this->hasMany(\App\Models\EscrowPayment::class);
    }

    public function debtCollections(): HasMany
    {
        return $this->hasMany(\App\Models\DebtCollection::class);
    }

    public function warehouseBookings(): HasMany
    {
        return $this->hasMany(\App\Models\WarehouseBooking::class);
    }

    // ── Scopes ────────────────────────────────────────────
    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeInCountry($query, string $countryCode)
    {
        return $query->where('country_code', $countryCode);
    }

    // ── Helpers ───────────────────────────────────────────
    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    public function isShipper(): bool
    {
        return $this->type === 'shipper';
    }

    public function isCarrier(): bool
    {
        return $this->type === 'carrier';
    }

    public function isForwarder(): bool
    {
        return $this->type === 'forwarder';
    }

    public function getAllTransportOrders()
    {
        return TransportOrder::where('shipper_id', $this->id)
            ->orWhere('carrier_id', $this->id)
            ->get();
    }
}
