<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TrackingShare extends Model
{
    protected $fillable = [
        'shipment_id', 'created_by', 'share_token',
        'recipient_email', 'recipient_name',
        'expires_at', 'is_active', 'permissions',
        'view_count', 'last_viewed_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_viewed_at' => 'datetime',
        'is_active' => 'boolean',
        'permissions' => 'array',
    ];

    public function shipment() { return $this->belongsTo(Shipment::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    public function scopeActive($q)
    {
        return $q->where('is_active', true)->where('expires_at', '>', now());
    }

    public function isValid(): bool
    {
        return $this->is_active && $this->expires_at->isFuture();
    }

    public function recordView(): void
    {
        $this->increment('view_count');
        $this->update(['last_viewed_at' => now()]);
    }

    public function revoke(): void
    {
        $this->update(['is_active' => false]);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($share) {
            if (!$share->share_token) {
                $share->share_token = Str::random(64);
            }
        });
    }
}
