'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface DatePickerBaseProps {
  label?: string;
  error?: string;
  mode?: 'single' | 'range';
  disabled?: boolean;
}

interface DatePickerSingleProps extends DatePickerBaseProps {
  mode?: 'single';
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  rangeStart?: never;
  rangeEnd?: never;
  onRangeChange?: never;
}

interface DatePickerRangeProps extends DatePickerBaseProps {
  mode: 'range';
  value?: never;
  onChange?: never;
  placeholder?: string;
  min?: string;
  max?: string;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onRangeChange: (start: Date | null, end: Date | null) => void;
}

type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

function formatDate(date: Date | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

const inputStyles = [
  'w-full rounded-md px-3 py-2 text-[14px] outline-none transition-shadow duration-150',
  'placeholder:text-[var(--ds-gray-700)]',
].join(' ');

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'disabled' | 'placeholder'>>(
  (props, ref) => {
    const { label, error, mode = 'single', disabled, placeholder, min, max, className, ...rest } = props as any;
    const inputId = label?.toLowerCase().replace(/\s+/g, '-');

    if (mode === 'range') {
      const { rangeStart, rangeEnd, onRangeChange } = props as DatePickerRangeProps;
      return (
        <div className="space-y-1.5">
          {label && (
            <label className="block text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
              {label}
            </label>
          )}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={ref}
                type="date"
                value={formatDate(rangeStart)}
                onChange={(e) => onRangeChange(parseDate(e.target.value), rangeEnd)}
                min={min}
                max={max}
                disabled={disabled}
                placeholder={placeholder || 'Start date'}
                aria-label="Start date"
                className={cn(
                  inputStyles,
                  error && 'shadow-[0_0_0_1px_var(--ds-red-700)]',
                  disabled && 'opacity-50 cursor-not-allowed',
                )}
                style={{
                  background: 'var(--ds-background-100)',
                  boxShadow: error ? undefined : 'var(--ds-shadow-input)',
                  color: 'var(--ds-gray-1000)',
                  borderRadius: '6px',
                }}
              />
            </div>
            <span className="text-[13px]" style={{ color: 'var(--ds-gray-700)' }}>to</span>
            <div className="relative flex-1">
              <input
                type="date"
                value={formatDate(rangeEnd)}
                onChange={(e) => onRangeChange(rangeStart, parseDate(e.target.value))}
                min={min || formatDate(rangeStart)}
                max={max}
                disabled={disabled}
                placeholder={placeholder || 'End date'}
                aria-label="End date"
                className={cn(
                  inputStyles,
                  error && 'shadow-[0_0_0_1px_var(--ds-red-700)]',
                  disabled && 'opacity-50 cursor-not-allowed',
                )}
                style={{
                  background: 'var(--ds-background-100)',
                  boxShadow: error ? undefined : 'var(--ds-shadow-input)',
                  color: 'var(--ds-gray-1000)',
                  borderRadius: '6px',
                }}
              />
            </div>
          </div>
          {error && (
            <p className="text-xs" style={{ color: 'var(--ds-red-900)' }}>{error}</p>
          )}
        </div>
      );
    }

    const { value, onChange } = props as DatePickerSingleProps;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium" style={{ color: 'var(--ds-gray-1000)' }}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="date"
            value={formatDate(value)}
            onChange={(e) => onChange(parseDate(e.target.value))}
            min={min}
            max={max}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={!!error}
            className={cn(
              inputStyles,
              error && 'shadow-[0_0_0_1px_var(--ds-red-700)]',
              disabled && 'opacity-50 cursor-not-allowed',
              className,
            )}
            style={{
              background: 'var(--ds-background-100)',
              boxShadow: error ? undefined : 'var(--ds-shadow-input)',
              color: 'var(--ds-gray-1000)',
              borderRadius: '6px',
            }}
          />
        </div>
        {error && (
          <p className="text-xs" style={{ color: 'var(--ds-red-900)' }}>{error}</p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
