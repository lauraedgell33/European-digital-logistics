'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { dynamicPricingApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BoltIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import type { DynamicPrice } from '@/types';

export default function DynamicPricingPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    origin_country: 'DE', origin_city: 'Berlin',
    destination_country: 'FR', destination_city: 'Paris',
    vehicle_type: 'tautliner', weight_kg: 15000, distance_km: 1050,
  });

  const { data: activePrices, isLoading: loadingActive } = useQuery({
    queryKey: ['dynamic-prices-active'],
    queryFn: () => dynamicPricingApi.activePrices().then(r => r.data?.data || []),
  });

  const calcMutation = useMutation({
    mutationFn: () => dynamicPricingApi.calculate(form),
  });

  const result = calcMutation.data?.data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BoltIcon className="h-7 w-7" style={{ color: 'var(--ds-amber-500)' }} />
          {t('dynamicPricing.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('dynamicPricing.realTimeSurge')}</p>
      </div>

      {/* Calculator */}
      <Card>
        <CardHeader title={t('dynamicPricing.priceCalculator')} subtitle={t('dynamicPricing.getRealtimeQuote')} />
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('dynamicPricing.originCountry')}</label>
            <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
              value={form.origin_country} onChange={e => setForm({ ...form, origin_country: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('dynamicPricing.originCity')}</label>
            <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
              value={form.origin_city} onChange={e => setForm({ ...form, origin_city: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('dynamicPricing.destinationCountry')}</label>
            <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
              value={form.destination_country} onChange={e => setForm({ ...form, destination_country: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('dynamicPricing.destinationCity')}</label>
            <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
              value={form.destination_city} onChange={e => setForm({ ...form, destination_city: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('dynamicPricing.vehicleType')}</label>
            <select className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
              value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })}>
              <option value="tautliner">Tautliner</option>
              <option value="box">Box Truck</option>
              <option value="refrigerated">Refrigerated</option>
              <option value="flatbed">Flatbed</option>
              <option value="mega">Mega Trailer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('dynamicPricing.weightKg')}</label>
            <input type="number" className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
              value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('dynamicPricing.distanceKm')}</label>
            <input type="number" className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800"
              value={form.distance_km} onChange={e => setForm({ ...form, distance_km: Number(e.target.value) })} />
          </div>
          <div className="flex items-end">
            <Button onClick={() => calcMutation.mutate()} disabled={calcMutation.isPending} className="w-full">
              {calcMutation.isPending ? <Spinner size="sm" /> : <CalculatorIcon className="h-4 w-4 mr-2" />}
              {t('dynamicPricing.calculate')}
            </Button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="mx-4 mb-4 p-4 rounded-lg border-2" style={{ borderColor: 'var(--ds-blue-300)', backgroundColor: 'var(--ds-blue-50)' }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">{t('dynamicPricing.basePrice')}</p>
                <p className="text-lg font-semibold">{formatCurrency(result.base_price || 0, result.currency || 'EUR')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('dynamicPricing.dynamicPrice')}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--ds-blue-700)' }}>
                  {formatCurrency(result.dynamic_price || 0, result.currency || 'EUR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('dynamicPricing.surge')}</p>
                <p className="text-lg font-semibold">
                  {((result.surge_multiplier || 1) * 100 - 100).toFixed(0)}%
                  {(result.surge_multiplier || 1) > 1 
                    ? <ArrowTrendingUpIcon className="inline h-4 w-4 ml-1" style={{ color: 'var(--ds-red-500)' }} />
                    : <ArrowTrendingDownIcon className="inline h-4 w-4 ml-1" style={{ color: 'var(--ds-green-500)' }} />
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('dynamicPricing.validUntil')}</p>
                <p className="text-sm font-medium">{result.valid_until ? new Date(result.valid_until).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Active Prices */}
      <Card>
        <CardHeader title={t('dynamicPricing.activePrices')} subtitle={t('dynamicPricing.currentlyValidSurgePrices')} />
        {loadingActive ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : (activePrices || []).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CurrencyEuroIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>{t('dynamicPricing.noActiveDynamicPrices')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">{t('dynamicPricing.route')}</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">{t('dynamicPricing.vehicle')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">{t('dynamicPricing.base')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">{t('dynamicPricing.dynamic')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">{t('dynamicPricing.surge')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">{t('dynamicPricing.validUntil')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(activePrices as DynamicPrice[]).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">{p.origin_city}, {p.origin_country} → {p.destination_city}, {p.destination_country}</td>
                    <td className="px-4 py-3">{p.vehicle_type}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(p.base_price, p.currency)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(p.dynamic_price, p.currency)}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={p.surge_multiplier > 1.2 ? 'red' : p.surge_multiplier > 1 ? 'yellow' : 'green'}>
                        {((p.surge_multiplier - 1) * 100).toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{new Date(p.valid_until).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
