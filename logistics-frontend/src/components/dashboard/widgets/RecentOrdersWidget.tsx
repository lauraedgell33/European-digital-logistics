'use client';

import { useDashboard } from '@/hooks/useApi';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';
import type { TransportOrder } from '@/types';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function RecentOrdersWidget() {
  const { data: dashboard, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <div className="skeleton-geist h-9 w-9 rounded-md" />
              <div className="space-y-1.5">
                <div className="skeleton-geist h-3.5 w-24" />
                <div className="skeleton-geist h-3 w-32" />
              </div>
            </div>
            <div className="skeleton-geist h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const orders = (dashboard?.recent_orders || []).slice(0, 5);

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No recent orders"
        description="Your transport orders will appear here"
      />
    );
  }

  return (
    <div className="space-y-0">
      {orders.map((order: TransportOrder) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="flex items-center justify-between py-2.5 transition-colors no-underline group"
          style={{ borderBottom: '1px solid var(--ds-gray-200)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-md flex-shrink-0"
              style={{ background: 'var(--ds-gray-200)' }}
            >
              <ClipboardDocumentListIcon
                className="h-4 w-4"
                style={{ color: 'var(--ds-gray-900)' }}
              />
            </div>
            <div className="min-w-0">
              <p
                className="text-[13px] font-medium truncate group-hover:underline"
                style={{ color: 'var(--ds-gray-1000)' }}
              >
                {order.order_number}
              </p>
              <p className="text-[11px] truncate" style={{ color: 'var(--ds-gray-900)' }}>
                {order.pickup_city} → {order.delivery_city}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span
              className="text-[12px] font-medium hidden sm:inline"
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              {formatCurrency(order.total_price || 0)}
            </span>
            <StatusBadge status={order.status} />
          </div>
        </Link>
      ))}
      <div className="pt-3">
        <Link
          href="/orders"
          className="text-[12px] font-medium no-underline"
          style={{ color: 'var(--ds-blue-900)' }}
        >
          View all orders →
        </Link>
      </div>
    </div>
  );
}
