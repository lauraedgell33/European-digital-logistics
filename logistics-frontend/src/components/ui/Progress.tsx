'use client';

import React from 'react';

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  indeterminate?: boolean;
  className?: string;
}

const heightMap = {
  sm: '2px',
  md: '4px',
  lg: '8px',
};

const colorMap = {
  default: 'var(--ds-blue-700)',
  success: 'var(--ds-green-700)',
  warning: 'var(--ds-amber-700)',
  error: 'var(--ds-red-700)',
};

export default function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  indeterminate = false,
  className = '',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-[12px] tabular-nums" style={{ color: 'var(--ds-gray-800)' }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`progress-geist ${indeterminate ? 'progress-geist-indeterminate' : ''}`}
        style={{ height: heightMap[size] }}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `Progress: ${Math.round(percentage)}%`}
      >
        <div
          className="progress-geist-bar"
          style={{
            width: indeterminate ? undefined : `${percentage}%`,
            background: colorMap[variant],
          }}
        />
      </div>
    </div>
  );
}

// ─── Step Progress ──────────────────────────────────────────
interface StepProgressProps {
  steps: string[];
  currentStep: number; // 0-based
  className?: string;
}

export function StepProgress({ steps, currentStep, className = '' }: StepProgressProps) {
  return (
    <div className={`flex items-center w-full ${className}`} role="list" aria-label="Progress steps">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div 
            key={index} 
            className={`flex items-center ${isLast ? '' : 'flex-1'}`}
            role="listitem"
            aria-current={isCurrent ? 'step' : undefined}
          >
            <div className="flex flex-col items-center">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-200"
                style={{
                  background: isCompleted 
                    ? 'var(--ds-blue-700)' 
                    : isCurrent 
                      ? 'var(--ds-blue-200)' 
                      : 'var(--ds-gray-300)',
                  color: isCompleted 
                    ? '#fff' 
                    : isCurrent 
                      ? 'var(--ds-blue-900)' 
                      : 'var(--ds-gray-700)',
                }}
              >
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8L6.5 11L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span 
                className="text-[11px] mt-1.5 text-center max-w-[80px] leading-tight"
                style={{
                  color: isCurrent ? 'var(--ds-gray-1000)' : 'var(--ds-gray-700)',
                  fontWeight: isCurrent ? 500 : 400,
                }}
              >
                {step}
              </span>
            </div>
            
            {!isLast && (
              <div 
                className="flex-1 h-[2px] mx-2 mt-[-16px] rounded-full transition-all duration-300"
                style={{
                  background: isCompleted ? 'var(--ds-blue-700)' : 'var(--ds-gray-300)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
