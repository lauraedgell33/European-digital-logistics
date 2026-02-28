<?php

namespace App\Services;

use App\Models\PaymentTransaction;
use App\Models\Invoice;

class PaymentService
{
    /**
     * Process a payment via Stripe (simulated).
     */
    public function processStripePayment(array $data): PaymentTransaction
    {
        $reference = PaymentTransaction::generateReference();
        $feeRate = 0.029; // Stripe fee: 2.9% + €0.25
        $fixedFee = 0.25;
        $fee = round($data['amount'] * $feeRate + $fixedFee, 2);

        $transaction = PaymentTransaction::create([
            'company_id' => $data['company_id'],
            'invoice_id' => $data['invoice_id'] ?? null,
            'transport_order_id' => $data['transport_order_id'] ?? null,
            'escrow_payment_id' => $data['escrow_payment_id'] ?? null,
            'transaction_reference' => $reference,
            'payment_provider' => 'stripe',
            'provider_transaction_id' => 'pi_' . substr(md5(uniqid()), 0, 24),
            'payment_method_type' => $data['payment_method'] ?? 'card',
            'amount' => $data['amount'],
            'fee_amount' => $fee,
            'net_amount' => round($data['amount'] - $fee, 2),
            'currency' => $data['currency'] ?? 'EUR',
            'source_currency' => $data['source_currency'] ?? null,
            'exchange_rate' => $data['exchange_rate'] ?? null,
            'type' => $data['type'] ?? 'payment',
            'status' => 'completed',
            'metadata' => $data['metadata'] ?? null,
            'completed_at' => now(),
        ]);

        // Update invoice if linked
        if ($transaction->invoice_id) {
            $invoice = Invoice::find($transaction->invoice_id);
            if ($invoice) {
                $newPaid = $invoice->paid_amount + $transaction->amount;
                $invoice->update([
                    'paid_amount' => $newPaid,
                    'status' => $newPaid >= $invoice->total_amount ? 'paid' : 'partially_paid',
                    'paid_at' => $newPaid >= $invoice->total_amount ? now() : null,
                ]);
            }
        }

        return $transaction;
    }

    /**
     * Process a SEPA direct debit payment (simulated).
     */
    public function processSepaPayment(array $data): PaymentTransaction
    {
        $fee = round($data['amount'] * 0.008, 2); // SEPA: ~0.8%

        $transaction = PaymentTransaction::create([
            'company_id' => $data['company_id'],
            'invoice_id' => $data['invoice_id'] ?? null,
            'transport_order_id' => $data['transport_order_id'] ?? null,
            'transaction_reference' => PaymentTransaction::generateReference(),
            'payment_provider' => 'sepa',
            'provider_transaction_id' => 'sepa_' . substr(md5(uniqid()), 0, 16),
            'payment_method_type' => 'sepa_debit',
            'amount' => $data['amount'],
            'fee_amount' => $fee,
            'net_amount' => round($data['amount'] - $fee, 2),
            'currency' => 'EUR',
            'type' => $data['type'] ?? 'payment',
            'status' => 'processing', // SEPA takes 2-5 business days
            'metadata' => array_merge($data['metadata'] ?? [], [
                'iban' => substr($data['iban'] ?? '', 0, 4) . '****',
                'bic' => $data['bic'] ?? null,
                'mandate_reference' => $data['mandate_reference'] ?? null,
            ]),
        ]);

        return $transaction;
    }

    /**
     * Process a refund.
     */
    public function processRefund(PaymentTransaction $original, ?float $amount = null): PaymentTransaction
    {
        $refundAmount = $amount ?? $original->amount;

        return PaymentTransaction::create([
            'company_id' => $original->company_id,
            'invoice_id' => $original->invoice_id,
            'transport_order_id' => $original->transport_order_id,
            'transaction_reference' => PaymentTransaction::generateReference(),
            'payment_provider' => $original->payment_provider,
            'provider_transaction_id' => 're_' . substr(md5(uniqid()), 0, 24),
            'payment_method_type' => $original->payment_method_type,
            'amount' => $refundAmount,
            'fee_amount' => 0,
            'net_amount' => $refundAmount,
            'currency' => $original->currency,
            'type' => 'refund',
            'status' => 'completed',
            'metadata' => ['original_transaction' => $original->transaction_reference],
            'completed_at' => now(),
        ]);
    }

    /**
     * Get payment summary for a company.
     */
    public function getPaymentSummary(int $companyId): array
    {
        $completed = PaymentTransaction::where('company_id', $companyId)
            ->where('status', 'completed')
            ->where('type', 'payment');

        return [
            'total_payments' => $completed->count(),
            'total_amount' => round($completed->sum('amount'), 2),
            'total_fees' => round($completed->sum('fee_amount'), 2),
            'total_net' => round($completed->sum('net_amount'), 2),
            'by_provider' => PaymentTransaction::where('company_id', $companyId)
                ->where('status', 'completed')
                ->selectRaw('payment_provider, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('payment_provider')
                ->get(),
            'recent' => PaymentTransaction::where('company_id', $companyId)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
        ];
    }

    /**
     * Multi-currency exchange rates (simulated).
     */
    public function getExchangeRates(string $baseCurrency = 'EUR'): array
    {
        $rates = [
            'EUR' => 1.0, 'USD' => 1.08, 'GBP' => 0.86, 'CHF' => 0.96,
            'PLN' => 4.32, 'CZK' => 25.10, 'HUF' => 398.50, 'RON' => 4.97,
            'SEK' => 11.45, 'DKK' => 7.46, 'NOK' => 11.72, 'BGN' => 1.96,
            'HRK' => 7.53, 'TRY' => 35.20,
        ];

        if ($baseCurrency !== 'EUR') {
            $baseRate = $rates[$baseCurrency] ?? 1.0;
            $rates = array_map(fn($r) => round($r / $baseRate, 6), $rates);
        }

        return [
            'base' => $baseCurrency,
            'rates' => $rates,
            'updated_at' => now()->toIso8601String(),
        ];
    }
}
