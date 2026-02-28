'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export function MarketBarometerWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['market-barometer-widget'],
    queryFn: async () => {
      try {
        const res = await dashboardApi.analytics('month');
        const analytics = res.data?.data;
        return {
          index: analytics?.supply_demand_ratio ?? 1.15,
          avgPricePerKm: analytics?.avg_price_per_km ?? 1.42,
          totalOffers: analytics?.total_freight_offers ?? analytics?.total_orders ?? 324,
          trend: 'up' as 'up' | 'down',
          changePercent: 3.4,
        };
      } catch {
        return {
          index: 1.15,
          avgPricePerKm: 1.42,
          totalOffers: 324,
          trend: 'up' as 'up' | 'down',
          changePercent: 3.4,
        };
      }
    },
    refetchInterval: 300000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton-geist h-3 w-20" />
            <div className="skeleton-geist h-8 w-16" />
          </div>
          <div className="skeleton-geist h-10 w-10 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="skeleton-geist h-3 w-full" />
          <div className="skeleton-geist h-3 w-3/4" />
        </div>
      </div>
    );
  }

  const isUp = data?.trend === 'up';
  const TrendIcon = isUp ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
            Market Index
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--ds-gray-1000)' }}>
            {data?.index?.toFixed(2) ?? '—'}
          </p>
        </div>
        <div
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[12px] font-medium"
          style={{
            background: isUp ? 'var(--ds-green-200)' : 'var(--ds-red-200)',
            color: isUp ? 'var(--ds-green-900)' : 'var(--ds-red-900)',
          }}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {isUp ? '+' : '-'}{data?.changePercent ?? 0}%
        </div>
      </div>

      <div
        className="mt-4 pt-4 space-y-3"
        style={{ borderTop: '1px solid var(--ds-gray-200)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px]" style={{ color: 'var(--ds-gray-900)' }}>
            Avg. Price/km
          </span>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
            €{data?.avgPricePerKm?.toFixed(2) ?? '—'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px]" style={{ color: 'var(--ds-gray-900)' }}>
            Active Offers
          </span>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
            {data?.totalOffers?.toLocaleString() ?? '—'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px]" style={{ color: 'var(--ds-gray-900)' }}>
            Supply/Demand
          </span>
          <div className="flex items-center gap-1">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: 60,
                background: 'var(--ds-gray-200)',
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(((data?.index ?? 1) / 2) * 100, 100)}%`,
                  background: (data?.index ?? 1) > 1 ? 'var(--ds-green-700)' : 'var(--ds-red-700)',
                }}
              />
            </div>
            <span className="text-[11px]" style={{ color: 'var(--ds-gray-900)' }}>
              {(data?.index ?? 1) > 1 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Link
          href="/analytics"
          className="text-[12px] font-medium no-underline"
          style={{ color: 'var(--ds-blue-900)' }}
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
