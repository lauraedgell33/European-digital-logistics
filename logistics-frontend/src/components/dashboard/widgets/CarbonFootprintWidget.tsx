'use client';

import { useAnalytics } from '@/hooks/useApi';

export function CarbonFootprintWidget() {
  const { data: analytics, isLoading } = useAnalytics('month');

  // Sample data — in production this would come from an API
  const currentCO2 = 12.4; // tons
  const targetCO2 = 18; // tons
  const percentage = Math.min((currentCO2 / targetCO2) * 100, 100);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="skeleton-geist h-[100px] w-[100px] rounded-full" />
        <div className="skeleton-geist h-4 w-20" />
        <div className="skeleton-geist h-3 w-28" />
      </div>
    );
  }

  // Semi-circle gauge SVG
  const radius = 45;
  const cx = 55;
  const cy = 55;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (percentage / 100) * circumference;

  // Color based on percentage
  const getColor = (pct: number) => {
    if (pct < 50) return { stroke: 'var(--ds-green-700)', label: 'Excellent', bg: 'var(--ds-green-200)' };
    if (pct < 75) return { stroke: 'var(--ds-amber-700)', label: 'Moderate', bg: 'var(--ds-amber-200)' };
    return { stroke: 'var(--ds-red-700)', label: 'High', bg: 'var(--ds-red-200)' };
  };

  const colorConfig = getColor(percentage);

  return (
    <div className="flex flex-col items-center">
      {/* Semi-circle gauge */}
      <div className="relative">
        <svg width="110" height="65" viewBox="0 0 110 65">
          {/* Background arc */}
          <path
            d={`M 10 55 A ${radius} ${radius} 0 0 1 100 55`}
            fill="none"
            stroke="var(--ds-gray-200)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M 10 55 A ${radius} ${radius} 0 0 1 100 55`}
            fill="none"
            stroke={colorConfig.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
          <p className="text-xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
            {currentCO2}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--ds-gray-900)' }}>
            tons CO₂
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div
        className="mt-3 px-2.5 py-1 rounded-full text-[11px] font-medium"
        style={{ background: colorConfig.bg, color: colorConfig.stroke }}
      >
        {colorConfig.label}
      </div>

      {/* Target info */}
      <div
        className="mt-3 w-full pt-3 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--ds-gray-200)' }}
      >
        <div className="text-center flex-1">
          <p className="text-[10px]" style={{ color: 'var(--ds-gray-900)' }}>Current</p>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
            {currentCO2}t
          </p>
        </div>
        <div
          className="w-px h-6"
          style={{ background: 'var(--ds-gray-200)' }}
        />
        <div className="text-center flex-1">
          <p className="text-[10px]" style={{ color: 'var(--ds-gray-900)' }}>Target</p>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--ds-gray-1000)' }}>
            {targetCO2}t
          </p>
        </div>
      </div>
    </div>
  );
}
