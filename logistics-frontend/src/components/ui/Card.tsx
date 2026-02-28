import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  flat?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className, hover = false, flat = false, interactive = false, onClick, style }: CardProps) {
  const cardClass = interactive 
    ? 'geist-card-interactive' 
    : flat 
      ? 'geist-card-flat' 
      : 'geist-card';

  return (
    <div
      className={cn(
        cardClass,
        hover && !interactive && 'cursor-pointer hover-lift',
        'p-6',
        className
      )}
      onClick={onClick}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function CardHeader({ title, description, action, className, children }: CardHeaderProps) {
  if (children) {
    return <div className={cn('mb-4', className)}>{children}</div>;
  }
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        <h3
          className="text-[15px] font-semibold"
          style={{ color: 'var(--ds-gray-1000)' }}
        >
          {title}
        </h3>
        {description && (
          <p
            className="mt-1 text-[13px]"
            style={{ color: 'var(--ds-gray-900)' }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
  loading = false,
}: StatCardProps) {
  const changeColorVar = {
    positive: '--ds-green-900',
    negative: '--ds-red-900',
    neutral: '--ds-gray-900',
  }[changeType];

  const changeBgVar = {
    positive: '--ds-green-200',
    negative: '--ds-red-200',
    neutral: '--ds-gray-200',
  }[changeType];

  if (loading) {
    return (
      <div className={cn('geist-card p-6', className)}>
        <div className="space-y-3">
          <div className="skeleton-geist h-4 w-24" />
          <div className="skeleton-geist h-8 w-32" />
          <div className="skeleton-geist h-3 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('geist-card p-6 transition-all duration-200 hover:shadow-lg', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p
            className="text-[13px] font-medium"
            style={{ color: 'var(--ds-gray-900)' }}
          >
            {title}
          </p>
          <p
            className="text-3xl font-bold tracking-tight tabular-nums"
            style={{ color: 'var(--ds-gray-1000)' }}
          >
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center text-[12px] font-medium px-1.5 py-0.5 rounded-md"
                style={{ 
                  color: `var(${changeColorVar})`,
                  background: `var(${changeBgVar})`,
                }}
              >
                {changeType === 'positive' && (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="mr-0.5">
                    <path d="M8 12V4M4.5 7L8 3.5L11.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {changeType === 'negative' && (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="mr-0.5">
                    <path d="M8 4v8M4.5 9L8 12.5L11.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {change}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{
              background: 'var(--ds-blue-200)',
              color: 'var(--ds-blue-900)',
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton Card ──────────────────────────────────────────
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('geist-card p-6', className)}>
      <div className="space-y-4">
        <div className="skeleton-geist h-5 w-3/4" />
        <div className="skeleton-geist h-4 w-full" />
        <div className="skeleton-geist h-4 w-2/3" />
      </div>
    </div>
  );
}
