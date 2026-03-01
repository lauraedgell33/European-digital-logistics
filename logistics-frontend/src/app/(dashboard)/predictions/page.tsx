'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Loading';
import { predictionsApi } from '@/lib/api';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GlobeEuropeAfricaIcon,
  CurrencyEuroIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';

function StatCard({ title, value, subtitle, trend, icon: Icon }: {
  title: string; value: string; subtitle?: string; trend?: 'up' | 'down' | 'neutral'; icon: React.ElementType;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--ds-blue-100)' }}>
          <Icon className="h-5 w-5" style={{ color: 'var(--ds-blue-600)' }} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-2 text-xs">
          {trend === 'up' ? (
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" style={{ color: 'var(--ds-green-600)' }} />
          ) : trend === 'down' ? (
            <ArrowTrendingDownIcon className="h-4 w-4 mr-1" style={{ color: 'var(--ds-red-600)' }} />
          ) : null}
          <span style={{ color: trend === 'up' ? 'var(--ds-green-600)' : 'var(--ds-red-600)' }}>
            {trend === 'up' ? t('predictions.trendingUp') : t('predictions.trendingDown')}
          </span>
        </div>
      )}
    </Card>
  );
}

export default function PredictionsPage() {
  const { t } = useTranslation();
  const [region, setRegion] = useState('DE');
  const [tab, setTab] = useState<'demand' | 'pricing' | 'capacity' | 'market'>('market');

  const { data: marketData, isLoading: loadingMarket } = useQuery({
    queryKey: ['predictions-market'],
    queryFn: () => predictionsApi.market().then(r => r.data?.data),
  });

  const { data: demandData, isLoading: loadingDemand } = useQuery({
    queryKey: ['predictions-demand', region],
    queryFn: () => predictionsApi.demand({ region }).then(r => r.data?.data),
    enabled: tab === 'demand',
  });

  const { data: capacityData, isLoading: loadingCapacity } = useQuery({
    queryKey: ['predictions-capacity', region],
    queryFn: () => predictionsApi.capacity({ region }).then(r => r.data?.data),
    enabled: tab === 'capacity',
  });

  const tabs = [
    { key: 'market' as const, label: t('predictions.marketOverview'), icon: GlobeEuropeAfricaIcon },
    { key: 'demand' as const, label: t('predictions.demandForecast'), icon: ChartBarIcon },
    { key: 'pricing' as const, label: t('predictions.priceForecast'), icon: CurrencyEuroIcon },
    { key: 'capacity' as const, label: t('predictions.capacityForecast'), icon: TruckIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ChartBarIcon className="h-7 w-7" style={{ color: 'var(--ds-blue-500)' }} />
          {t('predictions.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t('predictions.aiPoweredForecasts')}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Region Selector */}
      {tab !== 'market' && (
        <div className="flex gap-2">
          {['DE', 'FR', 'NL', 'PL', 'ES', 'IT', 'RO', 'CZ'].map(code => (
            <button
              key={code}
              onClick={() => setRegion(code)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                region === code
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      )}

      {/* Market Overview */}
      {tab === 'market' && (
        loadingMarket ? <div className="flex justify-center p-12"><Spinner /></div> : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title={t('predictions.totalFreightOffers')} value={String(marketData?.total_freight_offers || 0)} icon={TruckIcon} trend="up" />
              <StatCard title={t('predictions.activeVehicles')} value={String(marketData?.total_vehicle_offers || 0)} icon={TruckIcon} trend="neutral" />
              <StatCard title={t('predictions.avgPricePerKm')} value={`€${(marketData?.average_price_per_km || 0).toFixed(2)}`} icon={CurrencyEuroIcon} trend="up" />
              <StatCard title={t('predictions.utilizationRate')} value={`${(marketData?.market_utilization || 0).toFixed(0)}%`} icon={ChartBarIcon} />
            </div>

            {marketData?.top_routes && (
              <Card>
                <CardHeader title={t('analytics.topRoutes')} subtitle={t('predictions.mostPopularTradeLanes')} />
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(marketData.top_routes || []).map((route: Record<string, unknown>, i: number) => (
                    <div key={i} className="p-3 flex items-center justify-between text-sm">
                      <span>{String(route.origin_country || '')} → {String(route.destination_country || '')}</span>
                      <Badge variant="blue">{String(route.count || 0)} {t('predictions.offers')}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )
      )}

      {/* Demand Forecast */}
      {tab === 'demand' && (
        loadingDemand ? <div className="flex justify-center p-12"><Spinner /></div> : (
          <Card>
            <CardHeader title={`${t('predictions.demandForecast')} — ${region}`} subtitle={t('predictions.sevenDayForecast')} />
            <div className="p-4">
              {demandData?.predictions ? (
                <div className="space-y-3">
                  {(demandData.predictions || []).map((p: Record<string, unknown>, i: number) => (
                    <div key={i} className="flex items-center gap-4 text-sm">
                      <span className="w-24 text-gray-500">{String(p.date || '')}</span>
                      <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Number(p.predicted_value || 0))}%`,
                            backgroundColor: 'var(--ds-blue-500)',
                          }}
                        />
                      </div>
                      <span className="w-16 text-right font-medium">{Number(p.predicted_value || 0).toFixed(0)}</span>
                      <Badge variant="gray">{Number(p.confidence || 0).toFixed(0)}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">{t('predictions.noForecastData')}</p>
              )}
            </div>
          </Card>
        )
      )}

      {/* Capacity */}
      {tab === 'capacity' && (
        loadingCapacity ? <div className="flex justify-center p-12"><Spinner /></div> : (
          <Card>
            <CardHeader title={`${t('predictions.capacityForecast')} — ${region}`} subtitle={t('predictions.capacityPrediction')} />
            <div className="p-4">
              {capacityData?.predictions ? (
                <div className="space-y-3">
                  {(capacityData.predictions || []).map((p: Record<string, unknown>, i: number) => (
                    <div key={i} className="flex items-center gap-4 text-sm">
                      <span className="w-24 text-gray-500">{String(p.date || '')}</span>
                      <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Number(p.predicted_value || 0))}%`,
                            backgroundColor: 'var(--ds-green-500)',
                          }}
                        />
                      </div>
                      <span className="w-16 text-right font-medium">{Number(p.predicted_value || 0).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">{t('predictions.noCapacityData')}</p>
              )}
            </div>
          </Card>
        )
      )}

      {/* Pricing tab placeholder - uses same data structure */}
      {tab === 'pricing' && (
        <Card>
          <CardHeader title={`${t('predictions.priceForecast')} — ${region}`} subtitle={t('predictions.priceForecastDesc')} />
          <div className="p-8 text-center text-gray-500">
            <CurrencyEuroIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>{t('predictions.priceForecastDesc')}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
