'use client';

import React, { forwardRef, useId, useState } from 'react';
import { 
  UseFormRegisterReturn, 
  FieldError, 
  FieldErrors 
} from 'react-hook-form';

// ─── Form Field Wrapper ─────────────────────────────────────
interface FormFieldProps {
  label: string;
  name: string;
  error?: FieldError | string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, name, error, required, hint, children, className = '' }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label 
        htmlFor={name} 
        className="block text-[13px] font-medium"
        style={{ color: 'var(--ds-gray-1000)' }}
      >
        {label}
        {required && <span className="ml-0.5" style={{ color: 'var(--ds-red-700)' }}>*</span>}
      </label>

      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            id: name,
            'aria-invalid': !!errorMessage || undefined,
            'aria-describedby': [
              errorMessage ? errorId : null,
              hint ? hintId : null,
            ].filter(Boolean).join(' ') || undefined,
          });
        }
        return child;
      })}

      {hint && !errorMessage && (
        <p id={hintId} className="text-[12px]" style={{ color: 'var(--ds-gray-700)' }}>
          {hint}
        </p>
      )}

      {errorMessage && (
        <p 
          id={errorId} 
          role="alert" 
          className="text-[12px] flex items-center gap-1 animate-fade-in"
          style={{ color: 'var(--ds-red-700)' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

// ─── Text Input ─────────────────────────────────────────────
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  register?: UseFormRegisterReturn;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: boolean | string;
  label?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ register, icon, suffix, error, label, className = '', ...props }, ref) => {
    const hasWrapper = icon || suffix;

    const inputElement = (
      <input
        ref={ref}
        className={`input-geist ${error ? 'input-error' : ''} ${icon ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''} ${className}`}
        {...register}
        {...props}
      />
    );

    if (!hasWrapper) return inputElement;

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--ds-gray-700)' }}>
            {icon}
          </div>
        )}
        {inputElement}
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ds-gray-700)' }}>
            {suffix}
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

// ─── Textarea ───────────────────────────────────────────────
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  register?: UseFormRegisterReturn;
  error?: boolean | string;
  showCount?: boolean;
  maxLength?: number;
  label?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ register, error, showCount, maxLength, label, className = '', ...props }, ref) => {
    const [charCount, setCharCount] = useState(0);

    return (
      <div className="relative">
        <textarea
          ref={ref}
          className={`input-geist ${error ? 'input-error' : ''} ${className}`}
          maxLength={maxLength}
          {...register}
          onChange={(e) => {
            setCharCount(e.target.value.length);
            register?.onChange?.(e);
            props.onChange?.(e);
          }}
          {...props}
        />
        {showCount && maxLength && (
          <span 
            className="absolute bottom-2 right-3 text-[11px]"
            style={{ color: charCount > maxLength * 0.9 ? 'var(--ds-amber-700)' : 'var(--ds-gray-600)' }}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

// ─── Select ─────────────────────────────────────────────────
interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  register?: UseFormRegisterReturn;
  error?: boolean | string;
  options: readonly { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  label?: string;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ register, error, options, placeholder, label, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`input-geist ${error ? 'input-error' : ''} ${className}`}
        {...register}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

SelectInput.displayName = 'SelectInput';

// ─── Checkbox ───────────────────────────────────────────────
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  register?: UseFormRegisterReturn;
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ register, label, description, className = '', ...props }, ref) => {
    const id = useId();

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className="mt-0.5 w-4 h-4 rounded border-gray-600 focus:ring-2 focus:ring-offset-0 cursor-pointer"
          style={{ accentColor: 'var(--ds-blue-700)' }}
          {...register}
          {...props}
        />
        <div>
          <label htmlFor={id} className="text-sm font-medium cursor-pointer" style={{ color: 'var(--ds-gray-1000)' }}>
            {label}
          </label>
          {description && (
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--ds-gray-700)' }}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ─── Form Error Summary ─────────────────────────────────────
interface FormErrorSummaryProps {
  errors: FieldErrors;
  title?: string;
}

export function FormErrorSummary({ errors, title = 'Please fix the following errors:' }: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors);
  if (errorEntries.length === 0) return null;

  return (
    <div 
      className="rounded-lg p-4 animate-fade-in" 
      role="alert"
      style={{ 
        background: 'var(--ds-red-200)', 
        border: '1px solid var(--ds-red-400)' 
      }}
    >
      <p className="text-sm font-medium mb-2" style={{ color: 'var(--ds-red-900)' }}>{title}</p>
      <ul className="space-y-1 text-[13px] list-disc pl-4" style={{ color: 'var(--ds-red-800)' }}>
        {errorEntries.map(([key, error]) => (
          <li key={key}>{(error as FieldError)?.message || `Invalid ${key}`}</li>
        ))}
      </ul>
    </div>
  );
}

// ─── Submit Button ──────────────────────────────────────────
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'error' | 'success';
}

export function SubmitButton({ 
  isLoading, 
  loadingText = 'Saving...', 
  variant = 'primary',
  children, 
  className = '', 
  disabled,
  ...props 
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className={`btn-geist btn-geist-${variant} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
          </svg>
          {loadingText}
        </>
      ) : children}
    </button>
  );
}
