<?php

namespace App\Services;

use App\Models\PaymentTransaction;
use App\Models\Invoice;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Refund as StripeRefund;
use Stripe\Customer;
use Stripe\SetupIntent;
use Stripe\Webhook;
use Stripe\Exception\ApiErrorException;

class PaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe PaymentIntent for the given amount.
     */
    public function createPaymentIntent(array $data): array
    {
        $amount = (int) round($data['amount'] * 100); // Stripe uses cents
        $currency = strtolower($data['currency'] ?? 'eur');

        $intentData = [
            'amount' => $amount,
            'currency' => $currency,
            'payment_method_types' => ['card', 'sepa_debit'],
            'metadata' => [
                'company_id' => $data['company_id'],
                'invoice_id' => $data['invoice_id'] ?? null,
                'transport_order_id' => $data['transport_order_id'] ?? null,
            ],
        ];

        if (!empty($data['customer_id'])) {
            $intentData['customer'] = $data['customer_id'];
        }

        if (!empty($data['payment_method_id'])) {
            $intentData['payment_method'] = $data['payment_method_id'];
            $intentData['confirm'] = true;
            $intentData['return_url'] = config('app.frontend_url') . '/payments/callback';
        }

        try {
            $intent = PaymentIntent::create($intentData);

            // Record the transaction
            $transaction = PaymentTransaction::create([
                'company_id' => $data['company_id'],
                'invoice_id' => $data['invoice_id'] ?? null,
                'transport_order_id' => $data['transport_order_id'] ?? null,
                'escrow_payment_id' => $data['escrow_payment_id'] ?? null,
                'transaction_reference' => PaymentTransaction::generateReference(),
                'payment_provider' => 'stripe',
                'provider_transaction_id' => $intent->id,
                'payment_method_type' => $data['payment_method'] ?? 'card',
                'amount' => $data['amount'],
                'fee_amount' => round($data['amount'] * 0.029 + 0.25, 2),
                'net_amount' => round($data['amount'] - ($data['amount'] * 0.029 + 0.25), 2),
                'currency' => strtoupper($currency),
                'type' => $data['type'] ?? 'payment',
                'status' => $this->mapStripeStatus($intent->status),
                'metadata' => ['stripe_client_secret' => $intent->client_secret],
            ]);

            return [
                'transaction' => $transaction,
                'client_secret' => $intent->client_secret,
                'payment_intent_id' => $intent->id,
                'status' => $intent->status,
                'requires_action' => $intent->status === 'requires_action',
            ];
        } catch (ApiErrorException $e) {
            throw new \RuntimeException('Stripe payment failed: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Confirm a PaymentIntent after 3D Secure or additional authentication.
     */
    public function confirmPayment(string $paymentIntentId): array
    {
        try {
            $intent = PaymentIntent::retrieve($paymentIntentId);

            if ($intent->status === 'requires_confirmation') {
                $intent->confirm();
            }

            $transaction = PaymentTransaction::where('provider_transaction_id', $paymentIntentId)->first();
            if ($transaction) {
                $transaction->update([
                    'status' => $this->mapStripeStatus($intent->status),
                    'completed_at' => $intent->status === 'succeeded' ? now() : null,
                ]);
                $this->updateInvoiceIfPaid($transaction);
            }

            return [
                'transaction' => $transaction,
                'status' => $intent->status,
            ];
        } catch (ApiErrorException $e) {
            throw new \RuntimeException('Payment confirmation failed: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Process Stripe webhook events.
     */
    public function handleWebhook(string $payload, string $sigHeader): void
    {
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\Exception $e) {
            throw new \RuntimeException('Webhook signature verification failed.', 400);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handlePaymentSucceeded($event->data->object);
                break;
            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($event->data->object);
                break;
            case 'charge.refunded':
                $this->handleChargeRefunded($event->data->object);
                break;
        }
    }

    private function handlePaymentSucceeded($paymentIntent): void
    {
        $transaction = PaymentTransaction::where('provider_transaction_id', $paymentIntent->id)->first();
        if ($transaction && $transaction->status !== 'completed') {
            $transaction->update(['status' => 'completed', 'completed_at' => now()]);
            $this->updateInvoiceIfPaid($transaction);
        }
    }

    private function handlePaymentFailed($paymentIntent): void
    {
        $transaction = PaymentTransaction::where('provider_transaction_id', $paymentIntent->id)->first();
        if ($transaction) {
            $transaction->update([
                'status' => 'failed',
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'failure_reason' => $paymentIntent->last_payment_error?->message ?? 'Unknown error',
                ]),
            ]);
        }
    }

    private function handleChargeRefunded($charge): void
    {
        $transaction = PaymentTransaction::where('provider_transaction_id', $charge->payment_intent)->first();
        if ($transaction) {
            $transaction->update(['status' => 'refunded']);
        }
    }

    /**
     * Process a real Stripe refund.
     */
    public function processRefund(PaymentTransaction $original, ?float $amount = null): PaymentTransaction
    {
        $refundAmount = $amount ?? $original->amount;

        try {
            $refundData = ['payment_intent' => $original->provider_transaction_id];
            if ($amount) {
                $refundData['amount'] = (int) round($amount * 100);
            }

            $stripeRefund = StripeRefund::create($refundData);

            return PaymentTransaction::create([
                'company_id' => $original->company_id,
                'invoice_id' => $original->invoice_id,
                'transport_order_id' => $original->transport_order_id,
                'transaction_reference' => PaymentTransaction::generateReference(),
                'payment_provider' => 'stripe',
                'provider_transaction_id' => $stripeRefund->id,
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
        } catch (ApiErrorException $e) {
            throw new \RuntimeException('Refund failed: ' . $e->getMessage(), 422);
        }
    }

    /**
     * Create or retrieve a Stripe customer for the company.
     */
    public function getOrCreateCustomer(int $companyId, string $email, string $name): string
    {
        $existing = PaymentTransaction::where('company_id', $companyId)
            ->whereNotNull('metadata->stripe_customer_id')
            ->first();

        if ($existing && !empty($existing->metadata['stripe_customer_id'])) {
            return $existing->metadata['stripe_customer_id'];
        }

        $customer = Customer::create([
            'email' => $email,
            'name' => $name,
            'metadata' => ['company_id' => $companyId],
        ]);

        return $customer->id;
    }

    /**
     * Create a SetupIntent for saving payment methods.
     */
    public function createSetupIntent(string $customerId): array
    {
        $setupIntent = SetupIntent::create([
            'customer' => $customerId,
            'payment_method_types' => ['card', 'sepa_debit'],
        ]);

        return [
            'client_secret' => $setupIntent->client_secret,
            'setup_intent_id' => $setupIntent->id,
        ];
    }

    /**
     * Map Stripe status to internal status.
     */
    private function mapStripeStatus(string $stripeStatus): string
    {
        return match ($stripeStatus) {
            'succeeded' => 'completed',
            'processing' => 'processing',
            'requires_payment_method', 'requires_confirmation', 'requires_action' => 'pending',
            'canceled' => 'cancelled',
            default => 'pending',
        };
    }

    private function updateInvoiceIfPaid(PaymentTransaction $transaction): void
    {
        if (!$transaction->invoice_id) return;

        $invoice = Invoice::find($transaction->invoice_id);
        if (!$invoice) return;

        $newPaid = $invoice->paid_amount + $transaction->amount;
        $invoice->update([
            'paid_amount' => $newPaid,
            'status' => $newPaid >= $invoice->total_amount ? 'paid' : 'partially_paid',
            'paid_at' => $newPaid >= $invoice->total_amount ? now() : null,
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
     * Multi-currency exchange rates (ECB-based).
     */
    public function getExchangeRates(string $baseCurrency = 'EUR'): array
    {
        $cacheKey = "exchange_rates_{$baseCurrency}";
        return cache()->remember($cacheKey, 3600, function () use ($baseCurrency) {
            // Default EUR rates — in production, fetch from ECB/fixer.io
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
        });
    }
}
