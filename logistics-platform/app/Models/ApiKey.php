<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApiKey extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'user_id', 'name',
        'key_hash', 'key_prefix', 'permissions', 'rate_limits',
        'allowed_ips', 'allowed_origins',
        'requests_today', 'requests_total',
        'last_used_at', 'expires_at', 'is_active',
    ];

    protected $casts = [
        'permissions' => 'array',
        'rate_limits' => 'array',
        'allowed_ips' => 'array',
        'allowed_origins' => 'array',
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $hidden = ['key_hash'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function usageLogs(): HasMany
    {
        return $this->hasMany(ApiUsageLog::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            });
    }

    public static function generateKey(): array
    {
        $key = 'lm_' . bin2hex(random_bytes(32));
        return [
            'key' => $key,
            'hash' => hash('sha256', $key),
            'prefix' => substr($key, 0, 8),
        ];
    }
}
