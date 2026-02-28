<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VatRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'invoice_id', 'transport_order_id',
        'origin_country', 'destination_country',
        'taxable_amount', 'vat_rate', 'vat_amount', 'currency',
        'vat_number_seller', 'vat_number_buyer',
        'is_reverse_charge', 'is_intra_community',
        'vat_scheme', 'tax_period', 'status', 'supporting_documents',
    ];

    protected $casts = [
        'taxable_amount' => 'decimal:2',
        'vat_rate' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'is_reverse_charge' => 'boolean',
        'is_intra_community' => 'boolean',
        'tax_period' => 'date',
        'supporting_documents' => 'array',
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

    /**
     * EU VAT rates by country.
     */
    public static function getVatRate(string $countryCode): float
    {
        $rates = [
            'AT' => 20, 'BE' => 21, 'BG' => 20, 'HR' => 25, 'CY' => 19,
            'CZ' => 21, 'DK' => 25, 'EE' => 22, 'FI' => 24, 'FR' => 20,
            'DE' => 19, 'GR' => 24, 'HU' => 27, 'IE' => 23, 'IT' => 22,
            'LV' => 21, 'LT' => 21, 'LU' => 17, 'MT' => 18, 'NL' => 21,
            'PL' => 23, 'PT' => 23, 'RO' => 19, 'SK' => 20, 'SI' => 22,
            'ES' => 21, 'SE' => 25, 'NO' => 25, 'CH' => 8.1,
        ];

        return $rates[$countryCode] ?? 20;
    }

    /**
     * Determine if reverse charge applies (B2B cross-border within EU).
     */
    public static function isReverseCharge(string $origin, string $destination, bool $isBusiness = true): bool
    {
        $euCountries = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'];
        return $isBusiness
            && $origin !== $destination
            && in_array($origin, $euCountries)
            && in_array($destination, $euCountries);
    }
}
