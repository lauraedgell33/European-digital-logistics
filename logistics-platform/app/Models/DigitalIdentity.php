<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigitalIdentity extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'user_id', 'did_identifier',
        'verification_level', 'credentials', 'attestations',
        'is_verified', 'verified_at', 'verified_by',
        'expires_at', 'verification_documents', 'public_key_hash',
    ];

    protected $casts = [
        'credentials' => 'array',
        'attestations' => 'array',
        'verification_documents' => 'array',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public static function generateDid(int $companyId): string
    {
        return 'did:logi:' . $companyId . ':' . substr(hash('sha256', uniqid()), 0, 16);
    }
}
