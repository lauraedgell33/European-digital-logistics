<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmartContract extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_hash', 'transport_order_id',
        'party_a_company_id', 'party_b_company_id',
        'contract_type', 'conditions', 'actions',
        'value', 'currency', 'condition_met', 'action_executed',
        'triggered_at', 'executed_at', 'execution_log',
        'status', 'expires_at',
    ];

    protected $casts = [
        'conditions' => 'array',
        'actions' => 'array',
        'execution_log' => 'array',
        'value' => 'decimal:2',
        'condition_met' => 'boolean',
        'action_executed' => 'boolean',
        'triggered_at' => 'datetime',
        'executed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function transportOrder(): BelongsTo
    {
        return $this->belongsTo(TransportOrder::class);
    }

    public function partyA(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'party_a_company_id');
    }

    public function partyB(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'party_b_company_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public static function generateHash(): string
    {
        return '0x' . hash('sha256', uniqid(mt_rand(), true));
    }
}
