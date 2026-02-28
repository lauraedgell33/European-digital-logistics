<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhiteLabel extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'subdomain', 'custom_domain', 'brand_name',
        'logo_url', 'favicon_url', 'brand_colors', 'features_enabled',
        'custom_translations', 'support_email', 'support_phone',
        'terms_of_service', 'privacy_policy',
        'is_active', 'plan', 'monthly_fee', 'currency',
    ];

    protected $casts = [
        'brand_colors' => 'array',
        'features_enabled' => 'array',
        'custom_translations' => 'array',
        'is_active' => 'boolean',
        'monthly_fee' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
