'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { paymentApi, vatApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import StripeCheckout from '@/components/payments/StripeCheckout';
import {
  CreditCardIcon,
  BanknotesIcon,
  ArrowPathIcon,
  CurrencyEuroIcon,
  DocumentChartBarIcon,
  ReceiptPercentIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import type { PaymentTransaction, PaymentSummary } from '@/types';

export default function PaymentsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'history' | 'vat' | 'rates'>('history');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState('EUR');

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments-history'],
    queryFn: () => paymentApi.history().then(r => r.data?.data || []),
  });

  const { data: summary } = useQuery({
    queryKey: ['payments-summary'],
    queryFn: () => paymentApi.summary().then(r => r.data?.data),
  });

  const { data: exchangeRates } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: () => paymentApi.exchangeRates().then(r => r.data?.data),
    enabled: tab === 'rates',
  });

  const { data: vatRates } = useQuery({
    queryKey: ['vat-rates'],
    queryFn: () => vatApi.rates().then(r => r.data?.data),
    enabled: tab === 'vat',
  });

  const { data: vatReport } = useQuery({
    queryKey: ['vat-report'],
    queryFn: () => vatApi.report().then(r => r.data?.data),
    enabled: tab === 'vat',
  });

  const refundMutation = useMutation({
    mutationFn: (id: number) => paymentApi.refund(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments-history'] }),
  });

  const sumData = summary as PaymentSummary | undefined;

  const statusColor = (s: string) => {
    const map: Record<string, string> = { completed: 'green', pending: 'yellow', processing: 'blue', failed: 'red', refunded: 'gray', partially_refunded: 'yellow' };
    return (map[s] || 'gray') as 'green' | 'yellow' | 'blue' | 'red' | 'gray';
  };

  const tabs = [
    { key: 'history' as const, label: t('payments.paymentHistory'), icon: CreditCardIcon },
    { key: 'vat' as const, label: t('payments.vatCompliance'), icon: ReceiptPercentIcon },
    { key: 'rates' as const, label: t('payments.exchangeRates'), icon: CurrencyEuroIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCardIcon className="h-7 w-7" style={{ color: 'var(--ds-green-500)' }} />
          {t('payments.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('payments.stripeSepaMultiCurrency')}</p>
      </div>

      {/* Summary */}
      {sumData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{sumData.total_payments}</p>
            <p className="text-xs text-gray-500">{t('payments.transactions')}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{formatCurrency(sumData.total_amount || 0, 'EUR')}</p>
            <p className="text-xs text-gray-500">{t('payments.totalVolume')}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--ds-amber-600)' }}>{formatCurrency(sumData.total_fees || 0, 'EUR')}</p>
            <p className="text-xs text-gray-500">{t('payments.feesPaid')}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-lg font-bold">
              {sumData.by_provider && Object.keys(sumData.by_provider).length > 0
                ? Object.keys(sumData.by_provider).join(', ')
                : 'N/A'}
            </p>
        

      {/* Make Payment */}
      <Card>
        <CardHeader title={t('payments.makeAPayment')} />
        <div className="p-4">
          {!showCheckout ? (
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('payments.amount')}</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('payments.currency')}</label>
                <select
                  value={paymentCurrency}
                  onChange={e => setPaymentCurrency(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                >
                  {['EUR', 'USD', 'GBP', 'CHF', 'PLN', 'CZK', 'SEK', 'DKK', 'NOK'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Button
                onClick={() => {
                  if (Number(paymentAmount) >= 1) setShowCheckout(true);
                }}
                disabled={!paymentAmount || Number(paymentAmount) < 1}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                {t('payments.payWithCard')}
              </Button>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t('payments.cardPayment')}</h3>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <StripeCheckout
                amount={Number(paymentAmount)}
                currency={paymentCurrency}
                onSuccess={() => {
                  setShowCheckout(false);
                  setPaymentAmount('');
                  queryClient.invalidateQueries({ queryKey: ['payments-history'] });
                  queryClient.invalidateQueries({ queryKey: ['payments-summary'] });
                }}
                onCancel={() => setShowCheckout(false)}
              />
            </div>
          )}
        </div>
      </Card>    <p className="text-xs text-gray-500">{t('payments.providers')}</p>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Payment History */}
      {tab === 'history' && (
        <Card>
          <CardHeader title={t('payments.paymentHistory')} />
          {isLoading ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : (payments || []).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CreditCardIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>{t('payments.noPaymentTransactions')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('payments.reference')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('payments.provider')}</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">{t('payments.amount')}</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">{t('payments.fee')}</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500">{t('common.status')}</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">{t('common.date')}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(payments as PaymentTransaction[]).map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-mono text-xs">{p.payment_reference}</td>
                      <td className="px-4 py-3">
                        <Badge variant="gray">{p.payment_provider.toUpperCase()}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(p.amount, p.currency)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(p.fee_amount, p.currency)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={statusColor(p.status)}>{p.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {p.status === 'completed' && (
                          <Button size="sm" variant="secondary" onClick={() => refundMutation.mutate(p.id)}>
                            <ArrowPathIcon className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* VAT Compliance */}
      {tab === 'vat' && (
        <div className="space-y-4">
          {vatReport && (
            <Card>
              <CardHeader title={t('payments.vatReport')} subtitle={t('payments.currentPeriodSummary')} />
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">{formatCurrency(Number((vatReport as Record<string, unknown>).total_vat_collected || 0), 'EUR')}</p>
                  <p className="text-xs text-gray-500">{t('payments.vatCollected')}</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{formatCurrency(Number((vatReport as Record<string, unknown>).total_vat_paid || 0), 'EUR')}</p>
                  <p className="text-xs text-gray-500">{t('payments.vatPaid')}</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{Number((vatReport as Record<string, unknown>).reverse_charge_count || 0)}</p>
                  <p className="text-xs text-gray-500">{t('payments.reverseCharge')}</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{Number((vatReport as Record<string, unknown>).intra_community_count || 0)}</p>
                  <p className="text-xs text-gray-500">{t('payments.intraCommunity')}</p>
                </div>
              </div>
            </Card>
          )}

          {vatRates && (
            <Card>
              <CardHeader title={t('payments.euVatRates')} subtitle={t('payments.standardRatesByCountry')} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">{t('common.country')}</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">{t('payments.rate')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(vatRates as Record<string, number>).map(([country, rate]) => (
                      <tr key={country}>
                        <td className="px-4 py-3">{country}</td>
                        <td className="px-4 py-3 text-right font-semibold">{rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Exchange Rates */}
      {tab === 'rates' && (
        <Card>
          <CardHeader title={t('payments.exchangeRates')} subtitle={t('payments.currentRatesBaseEur')} />
          {!exchangeRates ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">{t('payments.currency')}</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">{t('payments.rate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(exchangeRates as Record<string, number>).map(([cur, rate]) => (
                    <tr key={cur}>
                      <td className="px-4 py-3 font-medium">{cur}</td>
                      <td className="px-4 py-3 text-right">{Number(rate).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
