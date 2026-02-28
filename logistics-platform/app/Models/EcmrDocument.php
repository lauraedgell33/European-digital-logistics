<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EcmrDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ecmr_number', 'transport_order_id',
        'sender_company_id', 'carrier_company_id', 'consignee_company_id', 'created_by',
        'sender_name', 'sender_address', 'sender_country',
        'carrier_name', 'carrier_address', 'carrier_country',
        'consignee_name', 'consignee_address', 'consignee_country',
        'place_of_taking_over', 'date_of_taking_over',
        'place_of_delivery', 'date_of_delivery',
        'goods_description', 'gross_weight_kg', 'number_of_packages',
        'packaging_method', 'special_instructions', 'is_hazardous', 'adr_class',
        'sender_signature_hash', 'sender_signed_at',
        'carrier_signature_hash', 'carrier_signed_at',
        'consignee_signature_hash', 'consignee_signed_at',
        'blockchain_tx_hash', 'blockchain_network', 'blockchain_metadata', 'ipfs_hash',
        'status', 'status_history', 'remarks',
    ];

    protected $casts = [
        'goods_description' => 'array',
        'blockchain_metadata' => 'array',
        'status_history' => 'array',
        'date_of_taking_over' => 'date',
        'date_of_delivery' => 'date',
        'sender_signed_at' => 'datetime',
        'carrier_signed_at' => 'datetime',
        'consignee_signed_at' => 'datetime',
        'gross_weight_kg' => 'decimal:2',
        'is_hazardous' => 'boolean',
    ];

    public function transportOrder(): BelongsTo
    {
        return $this->belongsTo(TransportOrder::class);
    }

    public function senderCompany(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'sender_company_id');
    }

    public function carrierCompany(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'carrier_company_id');
    }

    public function consigneeCompany(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'consignee_company_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['cancelled']);
    }

    public function isFullySigned(): bool
    {
        return $this->sender_signature_hash
            && $this->carrier_signature_hash
            && $this->consignee_signature_hash;
    }

    public function isOnBlockchain(): bool
    {
        return !empty($this->blockchain_tx_hash);
    }

    public static function generateNumber(): string
    {
        return 'ECMR-' . date('Y') . '-' . strtoupper(substr(md5(uniqid()), 0, 8));
    }
}
