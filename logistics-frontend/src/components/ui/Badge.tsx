import { cn } from '@/lib/utils';

type BadgeVariant = 'gray' | 'blue' | 'green' | 'red' | 'amber' | 'yellow' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn('badge-geist', `badge-geist-${variant}`, className)}>
      {children}
    </span>
  );
}

const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  draft: 'gray',
  pending: 'amber',
  accepted: 'green',
  rejected: 'red',
  pickup_scheduled: 'blue',
  picked_up: 'blue',
  in_transit: 'blue',
  delivered: 'green',
  completed: 'green',
  cancelled: 'red',
  disputed: 'red',
  active: 'green',
  inactive: 'gray',
  expired: 'gray',
  waiting_pickup: 'amber',
  at_customs: 'amber',
  out_for_delivery: 'blue',
  delayed: 'red',
  exception: 'red',
  open: 'blue',
  closed: 'gray',
  awarded: 'green',
  submitted: 'blue',
  withdrawn: 'gray',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status] || 'gray';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Badge variant={variant} className={className}>
      <span
        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
        style={{
          background: `var(--ds-${variant === 'gray' ? 'gray' : variant}-700)`,
        }}
      />
      {label}
    </Badge>
  );
}
