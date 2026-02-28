<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Invoice extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'total_amount', 'paid_amount', 'invoice_number'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Invoice {$eventName}")
            ->useLogName('invoices');
    }

    protected $fillable = [
        'invoice_number', 'company_id', 'customer_company_id',
        'transport_order_id', 'created_by',
        'customer_name', 'customer_address', 'customer_vat_number', 'customer_country',
        'issue_date', 'due_date',
        'subtotal', 'tax_amount', 'tax_rate', 'total_amount', 'paid_amount',
        'currency', 'line_items', 'notes', 'payment_terms',
        'payment_method', 'bank_iban', 'bank_bic',
        'status', 'sent_at', 'paid_at', 'pdf_path',
    ];

    protected $casts = [
        'line_items' => 'array',
        'issue_date' => 'date',
        'due_date' => 'date',
        'sent_at' => 'datetime',
        'paid_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'status' => \App\Enums\InvoiceStatus::class,
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function customerCompany(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'customer_company_id');
    }

    public function transportOrder(): BelongsTo
    {
        return $this->belongsTo(TransportOrder::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function factoring(): HasOne
    {
        return $this->hasOne(InvoiceFactoring::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function vatRecords(): HasMany
    {
        return $this->hasMany(VatRecord::class);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'paid')
            ->where('due_date', '<', now());
    }

    public function scopeUnpaid($query)
    {
        return $query->whereNotIn('status', ['paid', 'cancelled', 'refunded']);
    }

    public function getBalanceDueAttribute(): float
    {
        return max(0, $this->total_amount - $this->paid_amount);
    }

    public function isOverdue(): bool
    {
        return $this->due_date->isPast() && !in_array($this->status, ['paid', 'cancelled']);
    }

    public static function generateNumber(int $companyId): string
    {
        $count = self::where('company_id', $companyId)->whereYear('created_at', now()->year)->count() + 1;
        return 'INV-' . now()->format('Y') . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeForCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeThisMonth($query)
    {
        return $query->where('created_at', '>=', now()->startOfMonth());
    }

    public function scopeByDateRange($query, $from, $to)
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }
}
