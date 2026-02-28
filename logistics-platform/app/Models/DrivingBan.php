<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DrivingBan extends Model
{
    protected $fillable = [
        'country_code', 'country_name', 'region', 'ban_type',
        'title', 'description',
        'start_time', 'end_time', 'days_of_week', 'start_date', 'end_date',
        'is_recurring', 'specific_dates',
        'min_weight_tons', 'max_height_m', 'max_width_m', 'max_length_m',
        'exemptions', 'fine_min', 'fine_max', 'fine_currency',
        'affected_roads', 'affected_zones',
        'source_url', 'last_verified', 'is_active',
    ];

    protected $appends = ['country', 'fine_amount'];

    protected $casts = [
        'days_of_week' => 'array',
        'specific_dates' => 'array',
        'exemptions' => 'array',
        'affected_roads' => 'array',
        'affected_zones' => 'array',
        'is_recurring' => 'boolean',
        'is_active' => 'boolean',
        'min_weight_tons' => 'decimal:2',
        'fine_min' => 'decimal:2',
        'fine_max' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'last_verified' => 'date',
    ];

    // Accessors for API compatibility
    public function getCountryAttribute(): string { return $this->country_code; }
    public function getFineAmountAttribute(): ?float { return $this->fine_max ?? $this->fine_min; }

    // Scopes
    public function scopeActive($q) { return $q->where('is_active', true); }
    public function scopeForCountry($q, $cc) { return $q->where('country_code', $cc); }
    public function scopeOfType($q, $type) { return $q->where('ban_type', $type); }

    public function scopeCurrentlyActive($q)
    {
        $now = now();
        $today = $now->format('Y-m-d');
        $dayOfWeek = $now->dayOfWeek;

        return $q->where('is_active', true)
            ->where(function ($q2) use ($today, $dayOfWeek) {
                // Recurring bans on specific days
                $q2->where(function ($q3) use ($dayOfWeek) {
                    $q3->whereJsonContains('days_of_week', $dayOfWeek);
                })
                // Or specific date bans
                ->orWhere(function ($q3) use ($today) {
                    $q3->whereJsonContains('specific_dates', $today);
                })
                // Or seasonal bans
                ->orWhere(function ($q3) use ($today) {
                    $q3->whereNotNull('start_date')
                        ->whereNotNull('end_date')
                        ->where('start_date', '<=', $today)
                        ->where('end_date', '>=', $today);
                });
            });
    }

    /**
     * Check if a ban is active at a given datetime.
     */
    public function isActiveAt(\Carbon\Carbon $dateTime): bool
    {
        if (!$this->is_active) return false;

        // Check day of week
        if ($this->days_of_week && !in_array($dateTime->dayOfWeek, $this->days_of_week)) {
            return false;
        }

        // Check specific dates
        if ($this->specific_dates && in_array($dateTime->format('Y-m-d'), $this->specific_dates)) {
            return true;
        }

        // Check seasonal range
        if ($this->start_date && $this->end_date) {
            if ($dateTime->lt($this->start_date) || $dateTime->gt($this->end_date)) {
                return false;
            }
        }

        // Check time range
        if ($this->start_time && $this->end_time) {
            $currentTime = $dateTime->format('H:i:s');
            if ($currentTime < $this->start_time || $currentTime > $this->end_time) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all countries with the official names.
     */
    public static function getCountryList(): array
    {
        return [
            'AT' => 'Austria', 'BE' => 'Belgium', 'BG' => 'Bulgaria',
            'CH' => 'Switzerland', 'CZ' => 'Czech Republic', 'DE' => 'Germany',
            'DK' => 'Denmark', 'EE' => 'Estonia', 'ES' => 'Spain',
            'FI' => 'Finland', 'FR' => 'France', 'GB' => 'United Kingdom',
            'GR' => 'Greece', 'HR' => 'Croatia', 'HU' => 'Hungary',
            'IE' => 'Ireland', 'IT' => 'Italy', 'LT' => 'Lithuania',
            'LU' => 'Luxembourg', 'LV' => 'Latvia', 'NL' => 'Netherlands',
            'NO' => 'Norway', 'PL' => 'Poland', 'PT' => 'Portugal',
            'RO' => 'Romania', 'SE' => 'Sweden', 'SI' => 'Slovenia',
            'SK' => 'Slovakia',
        ];
    }
}
