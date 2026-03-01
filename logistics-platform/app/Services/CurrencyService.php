<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * Multi-currency service — exchange rates, conversion, history.
 * Uses ECB (European Central Bank) free API as primary source.
 */
class CurrencyService
{
    private const ECB_URL = 'https://api.exchangerate.host/latest';
    private const CACHE_TTL = 1800; // 30 min

    /** All supported currencies for European logistics. */
    public const SUPPORTED = [
        'EUR' => 'Euro',
        'USD' => 'US Dollar',
        'GBP' => 'British Pound',
        'CHF' => 'Swiss Franc',
        'PLN' => 'Polish Zloty',
        'CZK' => 'Czech Koruna',
        'HUF' => 'Hungarian Forint',
        'RON' => 'Romanian Leu',
        'BGN' => 'Bulgarian Lev',
        'HRK' => 'Croatian Kuna',
        'SEK' => 'Swedish Krona',
        'DKK' => 'Danish Krone',
        'NOK' => 'Norwegian Krone',
        'TRY' => 'Turkish Lira',
        'RSD' => 'Serbian Dinar',
        'UAH' => 'Ukrainian Hryvnia',
        'MDL' => 'Moldovan Leu',
        'GEL' => 'Georgian Lari',
    ];

    /**
     * Get all current exchange rates (base: EUR).
     */
    public function getRates(string $base = 'EUR'): array
    {
        $rates = $this->fetchRates();

        if ($base !== 'EUR' && isset($rates[$base])) {
            // Rebase rates
            $baseRate = $rates[$base];
            $rebased = [];
            foreach ($rates as $currency => $rate) {
                $rebased[$currency] = round($rate / $baseRate, 6);
            }
            $rebased[$base] = 1.0;
            $rates = $rebased;
        }

        return [
            'base'        => $base,
            'rates'       => $rates,
            'updated_at'  => now()->toIso8601String(),
            'source'      => 'ecb',
        ];
    }

    /**
     * Convert an amount between currencies.
     */
    public function convert(float $amount, string $from, string $to): array
    {
        $rates = $this->fetchRates();

        $fromRate = $from === 'EUR' ? 1.0 : ($rates[$from] ?? null);
        $toRate   = $to === 'EUR' ? 1.0 : ($rates[$to] ?? null);

        if (!$fromRate || !$toRate) {
            return [
                'error'   => 'Unsupported currency',
                'from'    => $from,
                'to'      => $to,
            ];
        }

        // Convert via EUR as intermediary
        $inEur     = $amount / $fromRate;
        $converted = round($inEur * $toRate, 4);
        $rate      = round($toRate / $fromRate, 6);

        // Persist for history
        $this->saveConversion($from, $to, $amount, $converted, $rate);

        return [
            'from'             => $from,
            'to'               => $to,
            'amount'           => $amount,
            'converted_amount' => $converted,
            'rate'             => $rate,
            'inverse_rate'     => round(1 / $rate, 6),
            'timestamp'        => now()->toIso8601String(),
        ];
    }

    /**
     * Get exchange rate history for a currency pair (last N days).
     */
    public function getHistory(string $from, string $to, int $days = 30): array
    {
        $history = DB::table('exchange_rate_history')
            ->where('from_currency', $from)
            ->where('to_currency', $to)
            ->where('date', '>=', now()->subDays($days)->toDateString())
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'rate' => round((float) $row->rate, 6),
            ]);

        // If no history exists, create a stub with the current rate
        if ($history->isEmpty()) {
            $rates = $this->fetchRates();
            $fromRate = $from === 'EUR' ? 1.0 : ($rates[$from] ?? 1);
            $toRate   = $to === 'EUR' ? 1.0 : ($rates[$to] ?? 1);
            $rate = round($toRate / $fromRate, 6);

            return [
                'from'    => $from,
                'to'      => $to,
                'days'    => $days,
                'history' => [['date' => now()->toDateString(), 'rate' => $rate]],
            ];
        }

        return [
            'from'    => $from,
            'to'      => $to,
            'days'    => $days,
            'history' => $history->values(),
        ];
    }

    /**
     * Convert a price in a model (e.g., FreightOffer.price) to target currency.
     */
    public function convertPrice(float $price, string $sourceCurrency, string $targetCurrency): float
    {
        if ($sourceCurrency === $targetCurrency) return $price;

        $result = $this->convert($price, $sourceCurrency, $targetCurrency);
        return $result['converted_amount'] ?? $price;
    }

    /**
     * List supported currencies.
     */
    public function supported(): array
    {
        return collect(self::SUPPORTED)->map(fn ($name, $code) => [
            'code' => $code,
            'name' => $name,
        ])->values()->toArray();
    }

    // ── Internal ──

    private function fetchRates(): array
    {
        return Cache::remember('currency:rates:EUR', self::CACHE_TTL, function () {
            try {
                // Try exchangerate.host (free, no key required)
                $response = Http::timeout(10)->get(self::ECB_URL, [
                    'base'    => 'EUR',
                    'symbols' => implode(',', array_keys(self::SUPPORTED)),
                ]);

                if ($response->successful() && $response->json('success') !== false) {
                    $data = $response->json('rates', []);
                    if (!empty($data)) {
                        $this->persistDailyRates($data);
                        return $data;
                    }
                }
            } catch (\Exception $e) {
                Log::warning('CurrencyService: API fetch failed', ['error' => $e->getMessage()]);
            }

            // Fallback: static approximate rates (updated periodically)
            return $this->fallbackRates();
        });
    }

    private function fallbackRates(): array
    {
        return [
            'EUR' => 1.0, 'USD' => 1.08, 'GBP' => 0.86, 'CHF' => 0.94,
            'PLN' => 4.33, 'CZK' => 25.2, 'HUF' => 395.0, 'RON' => 4.97,
            'BGN' => 1.96, 'HRK' => 7.53, 'SEK' => 11.45, 'DKK' => 7.46,
            'NOK' => 11.62, 'TRY' => 35.0, 'RSD' => 117.2, 'UAH' => 44.5,
            'MDL' => 19.2, 'GEL' => 2.95,
        ];
    }

    private function persistDailyRates(array $rates): void
    {
        $today = now()->toDateString();

        try {
            foreach ($rates as $currency => $rate) {
                DB::table('exchange_rate_history')->updateOrInsert(
                    ['from_currency' => 'EUR', 'to_currency' => $currency, 'date' => $today],
                    ['rate' => $rate, 'updated_at' => now()]
                );
            }
        } catch (\Exception $e) {
            // Table may not exist yet — fail silently
            Log::debug('CurrencyService: Could not persist rates', ['error' => $e->getMessage()]);
        }
    }

    private function saveConversion(string $from, string $to, float $amount, float $converted, float $rate): void
    {
        try {
            DB::table('exchange_rate_history')->updateOrInsert(
                ['from_currency' => $from, 'to_currency' => $to, 'date' => now()->toDateString()],
                ['rate' => $rate, 'updated_at' => now()]
            );
        } catch (\Exception $e) {
            // Fail silently
        }
    }
}
