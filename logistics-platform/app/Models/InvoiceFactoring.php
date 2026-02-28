<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceFactoring extends Model
{
    use HasFactory;

    protected $table = 'invoice_factoring';

    protected $fillable = [
        'invoice_id', 'company_id',
        'invoice_amount', 'advance_rate_pct', 'advance_amount',
        'fee_pct', 'fee_amount', 'net_amount', 'currency',
        'status', 'approved_at', 'funded_at', 'collected_at',
        'days_to_maturity', 'notes',
    ];

    protected $casts = [
        'invoice_amount' => 'decimal:2',
        'advance_rate_pct' => 'decimal:2',
        'advance_amount' => 'decimal:2',
        'fee_pct' => 'decimal:2',
        'fee_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'funded_at' => 'datetime',
        'collected_at' => 'datetime',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['requested', 'under_review']);
    }

    public static function calculateFactoring(float $amount, float $advanceRate = 85, float $feePct = 2.5): array
    {
        $advance = round($amount * ($advanceRate / 100), 2);
        $fee = round($amount * ($feePct / 100), 2);
        $net = round($advance - $fee, 2);

        return [
            'invoice_amount' => $amount,
            'advance_rate_pct' => $advanceRate,
            'advance_amount' => $advance,
            'fee_pct' => $feePct,
            'fee_amount' => $fee,
            'net_amount' => $net,
        ];
    }
}
