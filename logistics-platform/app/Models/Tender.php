<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tender extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'user_id', 'title', 'description', 'reference_number',
        'route_origin_country', 'route_origin_city',
        'route_destination_country', 'route_destination_city',
        'additional_stops',
        'cargo_type', 'vehicle_type', 'estimated_weight', 'estimated_volume',
        'frequency', 'shipments_per_period',
        'start_date', 'end_date', 'submission_deadline',
        'budget', 'currency', 'budget_type',
        'status', 'max_bidders', 'is_public', 'network_id',
        'evaluation_criteria', 'terms_conditions', 'required_documents',
    ];

    protected $casts = [
        'additional_stops' => 'array',
        'evaluation_criteria' => 'array',
        'required_documents' => 'array',
        'budget' => 'decimal:2',
        'estimated_weight' => 'decimal:2',
        'estimated_volume' => 'decimal:2',
        'is_public' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'submission_deadline' => 'date',
    ];

    // ── Boot ──────────────────────────────────────────────
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tender) {
            if (!$tender->reference_number) {
                $tender->reference_number = 'TND-' . date('Y') . '-' . str_pad(
                    static::withTrashed()->count() + 1,
                    5,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }

    // ── Relationships ─────────────────────────────────────
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bids(): HasMany
    {
        return $this->hasMany(TenderBid::class);
    }

    public function network(): BelongsTo
    {
        return $this->belongsTo(PartnerNetwork::class, 'network_id');
    }

    // ── Scopes ────────────────────────────────────────────
    public function scopeOpen($query)
    {
        return $query->where('status', 'open')
            ->where('submission_deadline', '>=', now());
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    // ── Helpers ───────────────────────────────────────────
    public function isOpen(): bool
    {
        return $this->status === 'open' && $this->submission_deadline->isFuture();
    }

    public function canBid(Company $company): bool
    {
        if (!$this->isOpen()) return false;
        if ($this->company_id === $company->id) return false;
        if ($this->max_bidders && $this->bids()->count() >= $this->max_bidders) return false;
        if ($this->bids()->where('company_id', $company->id)->exists()) return false;
        return true;
    }

    public function getRoute(): string
    {
        return "{$this->route_origin_city}, {$this->route_origin_country} → {$this->route_destination_city}, {$this->route_destination_country}";
    }

    public function award(TenderBid $bid): void
    {
        $this->update(['status' => 'awarded']);
        $bid->update(['status' => 'accepted']);
        $this->bids()->where('id', '!=', $bid->id)->update(['status' => 'rejected']);
    }
}
