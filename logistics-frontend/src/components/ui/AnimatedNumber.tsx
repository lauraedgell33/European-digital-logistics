'use client';

import React from 'react';
import { useAnimatedNumber, useInView } from '@/hooks/useUtils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  format,
  className = '',
}: AnimatedNumberProps) {
  const { ref, hasBeenInView } = useInView({ threshold: 0.3 });
  const animated = useAnimatedNumber(hasBeenInView ? value : 0, duration, hasBeenInView);

  const displayValue = format
    ? format(animated)
    : animated.toFixed(decimals);

  return (
    <span 
      ref={ref as React.RefObject<HTMLSpanElement>} 
      className={`tabular-nums ${className}`}
      aria-label={`${prefix}${value.toFixed(decimals)}${suffix}`}
    >
      {prefix}{displayValue}{suffix}
    </span>
  );
}

// Convenience: format with locale thousands separator
export function AnimatedCurrency({
  value,
  currency = 'EUR',
  locale = 'de-DE',
  duration = 1200,
  className = '',
}: {
  value: number;
  currency?: string;
  locale?: string;
  duration?: number;
  className?: string;
}) {
  const { ref, hasBeenInView } = useInView({ threshold: 0.3 });
  const animated = useAnimatedNumber(hasBeenInView ? value : 0, duration, hasBeenInView);

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(animated);

  return (
    <span 
      ref={ref as React.RefObject<HTMLSpanElement>} 
      className={`tabular-nums ${className}`}
      aria-label={new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)}
    >
      {formatted}
    </span>
  );
}
