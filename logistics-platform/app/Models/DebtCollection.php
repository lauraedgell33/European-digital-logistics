<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DebtCollection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'creditor_company_id', 'debtor_company_id', 'transport_order_id', 'created_by',
        'debtor_name', 'debtor_email', 'debtor_phone', 'debtor_country',
        'invoice_number', 'invoice_date', 'due_date',
        'original_amount', 'outstanding_amount', 'currency',
        'reminder_count', 'last_reminder_date',
        'status', 'collected_amount', 'collection_fee',
        'documents', 'notes', 'resolution_notes', 'resolved_at',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'last_reminder_date' => 'date',
        'original_amount' => 'decimal:2',
        'outstanding_amount' => 'decimal:2',
        'collected_amount' => 'decimal:2',
        'collection_fee' => 'decimal:2',
        'documents' => 'array',
        'resolved_at' => 'datetime',
    ];

    public function creditor() { return $this->belongsTo(Company::class, 'creditor_company_id'); }
    public function debtor() { return $this->belongsTo(Company::class, 'debtor_company_id'); }
    public function transportOrder() { return $this->belongsTo(TransportOrder::class); }
    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }

    public function scopeForCompany($q, $companyId)
    {
        return $q->where('creditor_company_id', $companyId);
    }

    public function daysOverdue(): int
    {
        return max(0, now()->diffInDays($this->due_date, false) * -1);
    }

    /**
     * Calculate collection fee using RVG-style fee schedule.
     */
    public static function calculateFee(float $outstandingAmount): array
    {
        $processingFee = 25.0; // €25 base processing fee

        // Success fee based on amount (simplified RVG)
        if ($outstandingAmount <= 500) {
            $successFee = $outstandingAmount * 0.15;
        } elseif ($outstandingAmount <= 2000) {
            $successFee = 75 + ($outstandingAmount - 500) * 0.12;
        } elseif ($outstandingAmount <= 10000) {
            $successFee = 255 + ($outstandingAmount - 2000) * 0.08;
        } else {
            $successFee = 895 + ($outstandingAmount - 10000) * 0.05;
        }

        return [
            'processing_fee' => $processingFee,
            'success_fee' => round($successFee, 2),
            'total_max_fee' => round($processingFee + $successFee, 2),
            'fee_pct' => round(($processingFee + $successFee) / $outstandingAmount * 100, 2),
        ];
    }
}
