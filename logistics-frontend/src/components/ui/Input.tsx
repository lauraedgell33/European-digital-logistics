import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, suffix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium"
            style={{ color: 'var(--ds-gray-1000)' }}
          >
            {label}
            {props.required && <span className="ml-0.5" style={{ color: 'var(--ds-red-700)' }}>*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--ds-gray-700)' }}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-geist',
              icon && 'pl-10',
              suffix && 'pr-10',
              error && 'shadow-[0_0_0_1px_var(--ds-red-700)]',
              className
            )}
            {...props}
          />
          {suffix && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--ds-gray-700)' }}
            >
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs" style={{ color: 'var(--ds-red-900)' }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: 'var(--ds-gray-700)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
