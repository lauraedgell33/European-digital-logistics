<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EdiMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'erp_integration_id', 'message_type',
        'message_reference', 'direction', 'format',
        'raw_content', 'parsed_content', 'validation_results',
        'is_valid', 'status', 'error_message',
        'transport_order_id', 'invoice_id', 'processed_at',
    ];

    protected $casts = [
        'parsed_content' => 'array',
        'validation_results' => 'array',
        'is_valid' => 'boolean',
        'processed_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function erpIntegration(): BelongsTo
    {
        return $this->belongsTo(ErpIntegration::class);
    }

    public function transportOrder(): BelongsTo
    {
        return $this->belongsTo(TransportOrder::class);
    }

    public function invoice(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Invoice::class);
    }

    public function scopeInbound($query)
    {
        return $query->where('direction', 'inbound');
    }

    public function scopeOutbound($query)
    {
        return $query->where('direction', 'outbound');
    }
}
