'use client';

import { useDashboard, useAnalytics } from '@/hooks/useApi';
import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Loading';
import { formatCurrency, formatWeight, getCountryFlag } from '@/lib/utils';
import { useState } from 'react';
import { ExportMenu, ExportIcons } from '@/components/ui/ExportMenu';
import { exportApi } from '@/lib/export';
import { useTranslation } from '@/hooks/useTranslation';
import {
  CurrencyEuroIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  MapIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';

// Simple bar chart component (no external dep)
function BarChart({
  data,
  maxValue,
  color = 'var(--ds-blue-700)',
}: {
  data: { label: string; value: number }[];
  maxValue?: number;
  color?: string;
}) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span
            className="text-[12px] w-16 text-right flex-shrink-0"
            style={{ color: 'var(--ds-gray-800)' }}
          >
            {item.label}
          </span>
          <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ background: 'var(--ds-gray-300)' }}>
            <div
              className="h-full rounded-md transition-all duration-700"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: color,
                minWidth: item.value > 0 ? '2px' : '0',
              }}
            />
          </div>
          <span
            className="text-[12px] font-mono w-12 text-right flex-shrink-0"
            style={{ color: 'var(--ds-gray-1000)' }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// Donut chart
function DonutChart({
  segments,
  size = 140,
  strokeWidth = 24,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="flex-shrink-0"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ds-gray-300)"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const dashLength = pct * circumference;
          const dashOffset = -cumulativeOffset * circumference;
          cumulativeOffset += pct;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-700"
            />
          );
        })}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-xl font-bold"
          fill="var(--ds-gray-1000)"
        >
          {total}
        </text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: seg.color }}
            />
            <span className="text-[12px]" style={{ color: 'var(--ds-gray-900)' }}>
              {seg.label}
            </span>
            <span
              className="text-[12px] font-mono ml-auto"
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sparkline
function Sparkline({
  data,
  height = 48,
  width = 200,
  color = 'var(--ds-blue-700)',
}: {
  data: number[];
  height?: number;
  width?: number;
  color?: string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);

  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#sparkGrad)"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AnalyticsClient() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('month');
  const { data: dashData, isLoading: loadingDash } = useDashboard();
  const { data: analyticsData, isLoading: loadingAnalytics } = useAnalytics(period);

  const stats = dashData;
  const analytics = analyticsData;

  if (loadingDash && loadingAnalytics) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Map real API data to chart formats, with empty-state fallback
  const revenueByMonth = analytics?.monthly_orders?.length
    ? analytics.monthly_orders.map((m: { month: string; revenue: string | number }) => ({
        label: new Date(m.month + '-01').toLocaleString('en', { month: 'short' }),
        value: Math.round(Number(m.revenue) || 0),
      }))
    : [];

  const ordersByStatus = analytics?.monthly_orders?.length
    ? (() => {
        const totals = { completed: 0, in_progress: 0 };
        analytics.monthly_orders.forEach((m: { completed?: string | number; total?: string | number }) => {
          totals.completed += Number(m.completed) || 0;
          totals.in_progress += (Number(m.total) || 0) - (Number(m.completed) || 0);
        });
        return [
          { label: t('analytics.completed'), value: totals.completed, color: 'var(--ds-green-700)' },
          { label: t('analytics.inProgress'), value: totals.in_progress, color: 'var(--ds-blue-700)' },
        ].filter((s) => s.value > 0);
      })()
    : [];

  const topRoutes = analytics?.top_routes?.length
    ? analytics.top_routes.map((r: { pickup_country: string; delivery_country: string; total_orders: string | number }) => ({
        label: `${r.pickup_country} → ${r.delivery_country}`,
        value: Number(r.total_orders) || 0,
      }))
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--ds-gray-1000)' }}
          >
            {t('analytics.title')}
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
            {t('analytics.businessInsights')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu
            options={[
              { label: 'PDF Report', icon: ExportIcons.pdf, onClick: () => exportApi.analyticsPdf() },
            ]}
          />
          <Select
            options={[
              { value: 'week', label: t('analytics.thisWeek') },
              { value: 'month', label: t('analytics.thisMonth') },
              { value: 'quarter', label: t('analytics.thisQuarter') },
              { value: 'year', label: t('analytics.thisYear') },
            ]}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('analytics.totalRevenue')}
          value={formatCurrency(analytics?.total_revenue ?? stats?.monthly_revenue ?? 0, 'EUR')}
          icon={<CurrencyEuroIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('analytics.ordersCompleted')}
          value={analytics?.completed_orders ?? 0}
          icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('analytics.activeShipments')}
          value={stats?.shipments_in_transit ?? 0}
          icon={<TruckIcon className="h-5 w-5" />}
        />
        <StatCard
          title={t('analytics.avgOrder')}
          value={formatCurrency(analytics?.avg_order_value ?? 0, 'EUR')}
          icon={<ArrowTrendingUpIcon className="h-5 w-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title={t('analytics.revenueOverview')}
            description={t('analytics.monthlyRevenueTrend')}
          />
          <div className="mt-6">
            {revenueByMonth.length > 0 ? (
              <BarChart data={revenueByMonth} color="var(--ds-blue-700)" />
            ) : (
              <p className="text-[13px] py-8 text-center" style={{ color: 'var(--ds-gray-600)' }}>
                {t('analytics.noRevenueData')}
              </p>
            )}
          </div>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader title={t('analytics.ordersByStatus')} description={t('analytics.currentDistribution')} />
          <div className="mt-6 flex justify-center">
            {ordersByStatus.length > 0 ? (
              <DonutChart segments={ordersByStatus} />
            ) : (
              <p className="text-[13px] py-8 text-center" style={{ color: 'var(--ds-gray-600)' }}>
                {t('analytics.noOrderData')}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Routes */}
        <Card>
          <CardHeader title={t('analytics.topRoutes')} description={t('analytics.mostPopularTradeLanes')} />
          <div className="mt-6">
            {topRoutes.length > 0 ? (
              <BarChart data={topRoutes} color="var(--ds-green-700)" />
            ) : (
              <p className="text-[13px] py-8 text-center" style={{ color: 'var(--ds-gray-600)' }}>
                {t('analytics.noRouteData')}
              </p>
            )}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader title={t('analytics.monthlyTrend')} description={t('analytics.ordersAndRevenueOverTime')} />
          <div className="mt-6 space-y-5">
            {analytics?.monthly_orders?.length ? (
              analytics.monthly_orders.map((m: { month: string; total: number; revenue: string | number; completed?: number }, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 pb-4"
                  style={{ borderBottom: i < analytics.monthly_orders.length - 1 ? '1px solid var(--ds-gray-300)' : 'none' }}
                >
                  <div className="flex-1">
                    <p className="text-[12px]" style={{ color: 'var(--ds-gray-800)' }}>
                      {new Date(m.month + '-01').toLocaleString('en', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--ds-gray-1000)' }}>
                      {m.total} orders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px]" style={{ color: 'var(--ds-gray-700)' }}>Revenue</p>
                    <p className="text-[14px] font-mono font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                      {formatCurrency(Number(m.revenue) || 0, 'EUR')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[13px] py-4 text-center" style={{ color: 'var(--ds-gray-600)' }}>
                {t('analytics.noDataAvailable')}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Route Details */}
      {analytics?.top_routes?.length > 0 && (
        <Card>
          <CardHeader title={t('analytics.routeDetails')} description={t('analytics.detailedRouteBreakdown')} />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ds-gray-300)' }}>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider pb-3 pr-4" style={{ color: 'var(--ds-gray-700)' }}>{t('analytics.route')}</th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wider pb-3 px-4" style={{ color: 'var(--ds-gray-700)' }}>{t('analytics.orders')}</th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wider pb-3 pl-4" style={{ color: 'var(--ds-gray-700)' }}>{t('analytics.avgPrice')}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.top_routes.map((route: { pickup_country: string; pickup_city: string; delivery_country: string; delivery_city: string; total_orders: number; avg_price: string | number }, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--ds-gray-200)' }}>
                    <td className="py-3 pr-4">
                      <span className="text-[14px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
                        {getCountryFlag(route.pickup_country)} {route.pickup_city} → {getCountryFlag(route.delivery_country)} {route.delivery_city}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[14px] font-mono" style={{ color: 'var(--ds-gray-1000)' }}>{route.total_orders}</span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <span className="text-[14px] font-mono" style={{ color: 'var(--ds-gray-1000)' }}>
                        {formatCurrency(Number(route.avg_price) || 0, 'EUR')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
