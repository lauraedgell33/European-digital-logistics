<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EscrowPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transport_order_id', 'payer_company_id', 'payee_company_id',
        'amount', 'currency', 'status',
        'payment_reference', 'payment_method', 'release_conditions',
        'funded_at', 'released_at', 'disputed_at',
        'dispute_reason', 'resolution_notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'funded_at' => 'datetime',
        'released_at' => 'datetime',
        'disputed_at' => 'datetime',
    ];

    public function transportOrder() { return $this->belongsTo(TransportOrder::class); }
    public function payer() { return $this->belongsTo(Company::class, 'payer_company_id'); }
    public function payee() { return $this->belongsTo(Company::class, 'payee_company_id'); }

    public function fund(): void
    {
        $this->update(['status' => 'funded', 'funded_at' => now()]);
    }

    public function release(): void
    {
        if ($this->status !== 'funded') throw new \Exception('Can only release funded escrow.');
        $this->update(['status' => 'released', 'released_at' => now()]);
    }

    public function dispute(string $reason): void
    {
        $this->update(['status' => 'disputed', 'disputed_at' => now(), 'dispute_reason' => $reason]);
    }

    public function refund(): void
    {
        $this->update(['status' => 'refunded']);
    }
}
