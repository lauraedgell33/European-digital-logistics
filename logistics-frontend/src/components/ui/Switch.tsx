'use client';

import React, { useId } from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
}: SwitchProps) {
  const id = useId();

  const sizeStyles = size === 'sm' 
    ? { width: 36, height: 20, knob: 16, translate: 16 }
    : { width: 44, height: 24, knob: 20, translate: 20 };

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="relative inline-flex items-center flex-shrink-0 rounded-full transition-colors duration-200 focus-ring"
        style={{
          width: sizeStyles.width,
          height: sizeStyles.height,
          background: checked ? 'var(--ds-blue-700)' : 'var(--ds-gray-400)',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span
          className="inline-block rounded-full transition-transform duration-200"
          style={{
            width: sizeStyles.knob,
            height: sizeStyles.knob,
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transform: `translateX(${checked ? sizeStyles.translate : 2}px)`,
          }}
        />
      </button>

      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label 
              htmlFor={id} 
              className="text-sm font-medium cursor-pointer"
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--ds-gray-700)' }}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
