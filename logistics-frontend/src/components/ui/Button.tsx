import { ButtonHTMLAttributes, forwardRef, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'error' | 'warning' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  ripple?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, icon, children, ripple = true, onClick, ...props }, ref) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef = (ref || internalRef) as React.RefObject<HTMLButtonElement>;

    const variantClass = {
      primary: 'btn-geist-primary',
      secondary: 'btn-geist-secondary',
      error: 'btn-geist-error',
      warning: 'btn-geist-warning',
      ghost: 'btn-geist-ghost',
      success: 'btn-geist-success',
    }[variant];

    const sizeClass = {
      sm: 'btn-geist-sm',
      md: '',
      lg: 'btn-geist-lg',
      xl: 'btn-geist-xl',
      icon: 'btn-geist-icon',
    }[size];

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      // Ripple effect
      if (ripple && buttonRef.current) {
        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const maxDim = Math.max(rect.width, rect.height);

        const rippleEl = document.createElement('span');
        rippleEl.className = 'ripple-effect';
        rippleEl.style.width = rippleEl.style.height = `${maxDim * 2}px`;
        rippleEl.style.left = `${x - maxDim}px`;
        rippleEl.style.top = `${y - maxDim}px`;

        button.appendChild(rippleEl);
        setTimeout(() => rippleEl.remove(), 600);
      }

      onClick?.(e);
    }, [ripple, onClick, buttonRef]);

    return (
      <button
        ref={buttonRef}
        disabled={disabled || loading}
        className={cn(
          'btn-geist',
          variantClass,
          sizeClass,
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={handleClick}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {!loading && icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
