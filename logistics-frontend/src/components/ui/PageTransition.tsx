'use client';

import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'scale';
  delay?: number;
  className?: string;
}

const variantClasses: Record<string, string> = {
  fade: 'animate-fade-in',
  slide: 'animate-slide-in-bottom',
  scale: 'animate-scale-in',
};

const variantStyles: Record<string, React.CSSProperties> = {
  fade: {},
  slide: {},
  scale: {},
};

export function PageTransition({
  children,
  variant = 'fade',
  delay = 0,
  className,
}: PageTransitionProps) {
  return (
    <div
      className={cn(variantClasses[variant], className)}
      style={{
        animationDelay: delay ? `${delay}ms` : undefined,
        animationFillMode: 'both',
        ...variantStyles[variant],
      }}
    >
      {children}
    </div>
  );
}
