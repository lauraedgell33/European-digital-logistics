<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentScan extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'user_id', 'transport_order_id',
        'document_type', 'original_filename', 'file_path', 'mime_type',
        'file_size_bytes', 'extracted_data', 'raw_ocr_text',
        'confidence_score', 'validation_errors', 'is_validated',
        'status', 'processing_notes',
    ];

    protected $casts = [
        'extracted_data' => 'array',
        'raw_ocr_text' => 'array',
        'validation_errors' => 'array',
        'confidence_score' => 'decimal:2',
        'is_validated' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transportOrder(): BelongsTo
    {
        return $this->belongsTo(TransportOrder::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('document_type', $type);
    }
}
