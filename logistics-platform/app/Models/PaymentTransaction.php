<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'invoice_id', 'transport_order_id', 'escrow_payment_id',
        'transaction_reference', 'payment_provider', 'provider_transaction_id',
        'payment_method_type', 'amount', 'fee_amount', 'net_amount',
        'currency', 'source_currency', 'exchange_rate',
        'type', 'status', 'metadata', 'failure_reason', 'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'exchange_rate' => 'decimal:6',
        'metadata' => 'array',
        'completed_at' => 'datetime',
        'status' => \App\Enums\PaymentStatus::class,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function transportOrder(): BelongsTo
    {
        return $this->belongsTo(TransportOrder::class);
    }

    public function escrowPayment(): BelongsTo
    {
        return $this->belongsTo(EscrowPayment::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeOfProvider($query, string $provider)
    {
        return $query->where('payment_provider', $provider);
    }

    public static function generateReference(): string
    {
        return 'TXN-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 12));
    }
}
