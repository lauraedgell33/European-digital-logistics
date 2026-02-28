<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ErpIntegration extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'integration_type', 'name',
        'connection_config', 'field_mappings', 'sync_settings',
        'is_active', 'last_sync_at',
        'sync_success_count', 'sync_error_count', 'last_sync_errors',
        'sync_direction', 'webhook_url', 'webhook_secret',
    ];

    protected $casts = [
        'connection_config' => 'encrypted:array',
        'field_mappings' => 'array',
        'sync_settings' => 'array',
        'last_sync_errors' => 'array',
        'is_active' => 'boolean',
        'last_sync_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function ediMessages(): HasMany
    {
        return $this->hasMany(EdiMessage::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
