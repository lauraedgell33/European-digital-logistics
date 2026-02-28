'use client';

import { useAnalytics } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';
import AnimatedNumber, { AnimatedCurrency } from '@/components/ui/AnimatedNumber';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function RevenueChartWidget() {
  const { data: analytics, isLoading } = useAnalytics('6');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton-geist h-3 w-16" />
              <div className="skeleton-geist h-6 w-24" />
            </div>
          ))}
        </div>
        <div className="skeleton-geist h-[140px] w-full rounded" />
      </div>
    );
  }

  const monthlyOrders = analytics?.monthly_orders || [];
  const totalRevenue = analytics?.total_revenue || 0;
  const completedOrders = analytics?.completed_orders || analytics?.total_orders || 0;
  const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : analytics?.avg_order_value || 0;

  // Generate SVG chart data
  const chartMonths: { month: string; revenue: number }[] = monthlyOrders.length > 0
    ? monthlyOrders.slice(-6).map((m: Record<string, unknown>) => ({
        month: String(m.month || ''),
        revenue: Number(m.revenue || 0),
      }))
    : [
        { month: 'Sep', revenue: 42000 },
        { month: 'Oct', revenue: 48000 },
        { month: 'Nov', revenue: 45000 },
        { month: 'Dec', revenue: 52000 },
        { month: 'Jan', revenue: 61000 },
        { month: 'Feb', revenue: 58000 },
      ];

  const revenues: number[] = chartMonths.map((m) => m.revenue);
  const maxRevenue = Math.max(...revenues, 1);
  const chartWidth = 400;
  const chartHeight = 140;
  const padding = { top: 10, right: 10, bottom: 24, left: 10 };
  const plotW = chartWidth - padding.left - padding.right;
  const plotH = chartHeight - padding.top - padding.bottom;

  const points = revenues.map((v, i) => ({
    x: padding.left + (i / Math.max(revenues.length - 1, 1)) * plotW,
    y: padding.top + plotH - (v / maxRevenue) * plotH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 0} ${padding.top + plotH} L ${padding.left} ${padding.top + plotH} Z`;

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-[12px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
            Total Revenue
          </p>
          <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--ds-gray-1000)' }}>
            <AnimatedCurrency value={totalRevenue} currency="EUR" />
          </p>
        </div>
        <div>
          <p className="text-[12px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
            Completed
          </p>
          <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--ds-gray-1000)' }}>
            <AnimatedNumber value={completedOrders} />
          </p>
        </div>
        <div>
          <p className="text-[12px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
            Avg. Value
          </p>
          <p className="text-lg font-bold mt-0.5" style={{ color: 'var(--ds-gray-1000)' }}>
            <AnimatedCurrency value={avgOrderValue} currency="EUR" />
          </p>
        </div>
      </div>

      {/* SVG area chart */}
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ds-blue-700)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--ds-blue-700)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding.left}
            y1={padding.top + plotH * (1 - ratio)}
            x2={padding.left + plotW}
            y2={padding.top + plotH * (1 - ratio)}
            stroke="var(--ds-gray-200)"
            strokeWidth="1"
            strokeDasharray={ratio === 0 ? 'none' : '4 3'}
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#revenueGradient)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="var(--ds-blue-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="var(--ds-background-100)" stroke="var(--ds-blue-700)" strokeWidth="2" />
          </g>
        ))}

        {/* Month labels */}
        {chartMonths.map((m, i) => (
          <text
            key={i}
            x={padding.left + (i / Math.max(chartMonths.length - 1, 1)) * plotW}
            y={chartHeight - 4}
            textAnchor="middle"
            fill="var(--ds-gray-900)"
            fontSize="10"
          >
            {m.month.slice(0, 3)}
          </text>
        ))}
      </svg>

      <div className="flex items-center justify-end mt-2">
        <Link
          href="/analytics"
          className="flex items-center gap-1 text-[12px] font-medium no-underline"
          style={{ color: 'var(--ds-blue-900)' }}
        >
          <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
          Full Analytics
        </Link>
      </div>
    </div>
  );
}
