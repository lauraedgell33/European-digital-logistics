<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartnerNetwork extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_company_id', 'name', 'description',
        'access_code', 'is_active', 'max_members', 'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    // ── Boot ──────────────────────────────────────────────
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($network) {
            if (!$network->access_code) {
                $network->access_code = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
            }
        });
    }

    // ── Relationships ─────────────────────────────────────
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'owner_company_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'network_members', 'network_id', 'company_id')
            ->withPivot(['status', 'role', 'joined_at'])
            ->withTimestamps();
    }

    public function activeMembers(): BelongsToMany
    {
        return $this->members()->wherePivot('status', 'active');
    }

    public function freightOffers(): HasMany
    {
        return $this->hasMany(FreightOffer::class, 'network_id');
    }

    public function vehicleOffers(): HasMany
    {
        return $this->hasMany(VehicleOffer::class, 'network_id');
    }

    public function tenders(): HasMany
    {
        return $this->hasMany(Tender::class, 'network_id');
    }

    // ── Helpers ───────────────────────────────────────────
    public function addMember(Company $company, string $role = 'member'): void
    {
        $this->members()->attach($company->id, [
            'status' => 'active',
            'role' => $role,
            'joined_at' => now(),
        ]);
    }

    public function inviteMember(Company $company, User $invitedBy): void
    {
        $this->members()->attach($company->id, [
            'status' => 'invited',
            'role' => 'member',
            'invited_by' => $invitedBy->id,
        ]);
    }

    public function removeMember(Company $company): void
    {
        $this->members()->updateExistingPivot($company->id, ['status' => 'removed']);
    }

    public function isMember(Company $company): bool
    {
        return $this->activeMembers()->where('company_id', $company->id)->exists();
    }

    public function isFull(): bool
    {
        return $this->max_members && $this->activeMembers()->count() >= $this->max_members;
    }
}
