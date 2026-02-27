import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[13px] font-medium"
            style={{ color: 'var(--ds-gray-1000)' }}
          >
            {label}
            {props.required && <span className="ml-0.5" style={{ color: 'var(--ds-red-700)' }}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={4}
          className={cn(
            'input-geist h-auto py-2 resize-y',
            error && 'shadow-[0_0_0_1px_var(--ds-red-700)]',
            className
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
