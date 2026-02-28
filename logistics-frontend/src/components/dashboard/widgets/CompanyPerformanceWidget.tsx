'use client';

import { useAnalytics } from '@/hooks/useApi';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

export function CompanyPerformanceWidget() {
  const { data: analytics, isLoading } = useAnalytics('month');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="skeleton-geist h-5 w-24" />
          <div className="skeleton-geist h-3 w-10" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="skeleton-geist h-3 w-24" />
            <div className="skeleton-geist h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  // Performance metrics — in production from a company API
  const rating = 4.6;
  const metrics = [
    {
      label: 'On-Time Delivery',
      value: 94,
      target: 95,
      colorVar: '--ds-green-700',
      bgVar: '--ds-green-200',
    },
    {
      label: 'Response Time',
      value: 87,
      target: 90,
      colorVar: '--ds-blue-700',
      bgVar: '--ds-blue-200',
      suffix: '< 2h avg',
    },
    {
      label: 'Completion Rate',
      value: 98,
      target: 95,
      colorVar: '--ds-green-700',
      bgVar: '--ds-green-200',
    },
    {
      label: 'Customer Satisfaction',
      value: 92,
      target: 90,
      colorVar: '--ds-amber-700',
      bgVar: '--ds-amber-200',
    },
  ];

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div>
      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => {
            if (i < fullStars) {
              return (
                <StarIcon
                  key={i}
                  className="h-4 w-4"
                  style={{ color: 'var(--ds-amber-600)' }}
                />
              );
            }
            if (i === fullStars && hasHalf) {
              return (
                <div key={i} className="relative">
                  <StarOutlineIcon className="h-4 w-4" style={{ color: 'var(--ds-amber-600)' }} />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                    <StarIcon className="h-4 w-4" style={{ color: 'var(--ds-amber-600)' }} />
                  </div>
                </div>
              );
            }
            return (
              <StarOutlineIcon
                key={i}
                className="h-4 w-4"
                style={{ color: 'var(--ds-gray-400)' }}
              />
            );
          })}
        </div>
        <span className="text-[14px] font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
          {rating}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--ds-gray-900)' }}>
          / 5.0
        </span>
      </div>

      {/* Metric bars */}
      <div className="space-y-3">
        {metrics.map((metric) => {
          const meetsTarget = metric.value >= metric.target;
          return (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
                  {metric.label}
                </span>
                <span
                  className="text-[12px] font-semibold"
                  style={{
                    color: meetsTarget ? 'var(--ds-green-900)' : 'var(--ds-amber-900)',
                  }}
                >
                  {metric.value}%
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--ds-gray-200)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${metric.value}%`,
                    background: `var(${metric.colorVar})`,
                  }}
                />
              </div>
              {metric.suffix && (
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--ds-gray-700)' }}>
                  {metric.suffix}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Target indicator */}
      <div
        className="mt-4 pt-3 flex items-center gap-2"
        style={{ borderTop: '1px solid var(--ds-gray-200)' }}
      >
        <div
          className="h-2 w-2 rounded-full"
          style={{ background: 'var(--ds-green-700)' }}
        />
        <span className="text-[11px]" style={{ color: 'var(--ds-gray-900)' }}>
          3 of 4 metrics meet target
        </span>
      </div>
    </div>
  );
}
