<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenderBid extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tender_id', 'company_id', 'user_id',
        'proposed_price', 'currency', 'proposal',
        'documents', 'transit_time_hours', 'additional_services',
        'pricing_breakdown', 'status', 'score',
        'evaluation_notes', 'submitted_at',
    ];

    protected $casts = [
        'proposed_price' => 'decimal:2',
        'score' => 'decimal:2',
        'documents' => 'array',
        'pricing_breakdown' => 'array',
        'submitted_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────
    public function tender(): BelongsTo
    {
        return $this->belongsTo(Tender::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Scopes ────────────────────────────────────────────
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeForTender($query, int $tenderId)
    {
        return $query->where('tender_id', $tenderId);
    }

    // ── Helpers ───────────────────────────────────────────
    public function submit(): void
    {
        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
    }

    public function withdraw(): void
    {
        $this->update(['status' => 'withdrawn']);
    }

    public function isSubmitted(): bool
    {
        return $this->status === 'submitted';
    }
}
