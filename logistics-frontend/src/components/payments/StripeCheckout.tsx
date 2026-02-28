'use client';

import { useState, useCallback } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { paymentApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: '"Inter", sans-serif',
      '::placeholder': { color: '#9CA3AF' },
      padding: '12px',
    },
    invalid: { color: '#EF4444', iconColor: '#EF4444' },
  },
};

interface StripeCheckoutProps {
  amount: number;
  currency?: string;
  invoiceId?: number;
  transportOrderId?: number;
  onSuccess?: (result: { paymentIntentId: string; transactionId: number }) => void;
  onCancel?: () => void;
}

function CheckoutForm({
  amount,
  currency = 'EUR',
  invoiceId,
  transportOrderId,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setLoading(true);
      setError(null);

      try {
        // 1. Create PaymentIntent on backend
        const { data } = await paymentApi.createIntent({
          amount,
          currency,
          invoice_id: invoiceId,
          transport_order_id: transportOrderId,
        });

        const clientSecret = data.client_secret;
        if (!clientSecret) {
          throw new Error('Failed to create payment intent.');
        }

        // 2. Confirm card payment with Stripe.js
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card element not found.');
        }

        const { error: stripeError, paymentIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement },
          });

        if (stripeError) {
          setError(stripeError.message ?? 'Payment failed.');
          setLoading(false);
          return;
        }

        if (paymentIntent?.status === 'succeeded') {
          setSucceeded(true);
          // Confirm on backend
          await paymentApi.confirmPayment(paymentIntent.id);
          onSuccess?.({
            paymentIntentId: paymentIntent.id,
            transactionId: data.data?.id,
          });
        } else if (paymentIntent?.status === 'requires_action') {
          // 3D Secure handled automatically by confirmCardPayment
          setError('Additional authentication required. Please follow the prompts.');
        } else {
          setError(`Unexpected payment status: ${paymentIntent?.status}`);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [stripe, elements, amount, currency, invoiceId, transportOrderId, onSuccess]
  );

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Successful!</h3>
        <p className="text-sm text-gray-500 mt-1">
          {formatCurrency(amount, currency)} has been charged successfully.
        </p>
        <Button className="mt-4" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Payment Amount
        </label>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(amount, currency)}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : (
            `Pay ${formatCurrency(amount, currency)}`
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Payments are processed securely by Stripe. Your card details never touch our servers.
      </p>
    </form>
  );
}

export default function StripeCheckout(props: StripeCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
