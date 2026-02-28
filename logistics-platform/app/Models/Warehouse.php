<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Warehouse extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'company_id', 'user_id',
        'country_code', 'city', 'postal_code', 'address', 'lat', 'lng',
        'name', 'description', 'total_area_m2', 'available_area_m2', 'ceiling_height_m',
        'storage_types', 'equipment', 'certifications',
        'has_loading_dock', 'has_rail_access', 'has_temperature_control',
        'min_temperature', 'max_temperature', 'has_hazardous_storage', 'adr_classes',
        'has_customs_warehouse', 'is_bonded', 'has_cross_docking', 'has_pick_pack',
        'has_security_24h', 'has_cctv', 'has_fire_protection',
        'pallet_spaces', 'available_pallet_spaces', 'loading_docks_count',
        'price_per_m2_month', 'price_per_pallet_month', 'currency', 'price_type',
        'available_from', 'available_to', 'min_rental_months',
        'status', 'is_public', 'network_id',
        'photos', 'contact_name', 'contact_phone', 'contact_email',
        'notes',
    ];

    protected $casts = [
        'lat' => 'decimal:8',
        'lng' => 'decimal:8',
        'total_area_m2' => 'decimal:2',
        'available_area_m2' => 'decimal:2',
        'ceiling_height_m' => 'decimal:2',
        'storage_types' => 'array',
        'equipment' => 'array',
        'certifications' => 'array',
        'has_loading_dock' => 'boolean',
        'has_rail_access' => 'boolean',
        'has_temperature_control' => 'boolean',
        'min_temperature' => 'decimal:2',
        'max_temperature' => 'decimal:2',
        'has_hazardous_storage' => 'boolean',
        'has_customs_warehouse' => 'boolean',
        'is_bonded' => 'boolean',
        'has_cross_docking' => 'boolean',
        'has_pick_pack' => 'boolean',
        'has_security_24h' => 'boolean',
        'has_cctv' => 'boolean',
        'has_fire_protection' => 'boolean',
        'price_per_m2_month' => 'decimal:2',
        'price_per_pallet_month' => 'decimal:2',
        'photos' => 'array',
        'is_public' => 'boolean',
        'available_from' => 'date',
        'available_to' => 'date',
    ];

    // Relationships
    public function company() { return $this->belongsTo(Company::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function network() { return $this->belongsTo(PartnerNetwork::class, 'network_id'); }
    public function bookings() { return $this->hasMany(WarehouseBooking::class); }
    public function activeBookings() { return $this->hasMany(WarehouseBooking::class)->whereIn('status', ['confirmed', 'active']); }

    // Scopes
    public function scopeActive($q) { return $q->where('status', 'active'); }
    public function scopePublic($q) { return $q->where('is_public', true); }
    public function scopeInCountry($q, $cc) { return $q->where('country_code', $cc); }
    public function scopeInCity($q, $city) { return $q->where('city', 'like', "%{$city}%"); }
    public function scopeWithStorageType($q, $type) { return $q->whereJsonContains('storage_types', $type); }
    public function scopeWithTemperatureControl($q) { return $q->where('has_temperature_control', true); }
    public function scopeWithHazardous($q) { return $q->where('has_hazardous_storage', true); }
    public function scopeMinArea($q, $area) { return $q->where('available_area_m2', '>=', $area); }
    public function scopeMinPalletSpaces($q, $spaces) { return $q->where('available_pallet_spaces', '>=', $spaces); }

    // Helpers
    public function occupancyRate(): float
    {
        if (!$this->total_area_m2 || $this->total_area_m2 == 0) return 0;
        $used = $this->total_area_m2 - ($this->available_area_m2 ?? 0);
        return round(($used / $this->total_area_m2) * 100, 1);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'active' && ($this->available_area_m2 > 0 || $this->available_pallet_spaces > 0);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photos')->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
        $this->addMediaCollection('documents')->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png']);
    }
}
