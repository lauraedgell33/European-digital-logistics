<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WarehouseBooking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'warehouse_id', 'tenant_company_id', 'created_by',
        'booked_area_m2', 'booked_pallet_spaces',
        'start_date', 'end_date', 'agreed_price', 'currency', 'price_period',
        'status', 'special_requirements', 'notes',
        'confirmed_at', 'cancelled_at', 'cancellation_reason',
    ];

    protected $casts = [
        'booked_area_m2' => 'decimal:2',
        'agreed_price' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function warehouse() { return $this->belongsTo(Warehouse::class); }
    public function tenant() { return $this->belongsTo(Company::class, 'tenant_company_id'); }
    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }

    public function scopePending($q) { return $q->where('status', 'pending'); }
    public function scopeActive($q) { return $q->whereIn('status', ['confirmed', 'active']); }

    public function confirm(): void
    {
        $this->update(['status' => 'confirmed', 'confirmed_at' => now()]);
    }

    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);
    }
}
