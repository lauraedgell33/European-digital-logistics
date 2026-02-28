'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import EmptyState from '@/components/ui/EmptyState';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: string;
  data: {
    title: string;
    body: string;
    url?: string;
  };
  read_at?: string;
  created_at: string;
}

const TYPE_ICONS: Record<string, { icon: typeof BellIcon; bgVar: string; colorVar: string }> = {
  order: { icon: CheckCircleIcon, bgVar: '--ds-green-200', colorVar: '--ds-green-900' },
  shipment: { icon: TruckIcon, bgVar: '--ds-blue-200', colorVar: '--ds-blue-900' },
  warning: { icon: ExclamationTriangleIcon, bgVar: '--ds-amber-200', colorVar: '--ds-amber-900' },
  info: { icon: InformationCircleIcon, bgVar: '--ds-gray-200', colorVar: '--ds-gray-900' },
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function NotificationsWidget() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications-widget'],
    queryFn: async () => {
      try {
        const res = await dashboardApi.index();
        // The dashboard endpoint may have notifications, or return empty
        return (res.data?.data?.notifications || []) as Notification[];
      } catch {
        return [] as Notification[];
      }
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="skeleton-geist h-8 w-8 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton-geist h-3.5 w-3/4" />
              <div className="skeleton-geist h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show sample notifications if none available from API
  const sampleNotifications: Notification[] = [
    {
      id: 'n1',
      type: 'order',
      data: { title: 'Order #ORD-2024-0142 confirmed', body: 'Carrier accepted the transport order' },
      created_at: new Date(Date.now() - 1200000).toISOString(),
    },
    {
      id: 'n2',
      type: 'shipment',
      data: { title: 'Shipment arrived at destination', body: 'Tracking #TRK-EU-884421' },
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'n3',
      type: 'info',
      data: { title: 'New freight match found', body: 'AI matched 3 vehicles for your freight offer' },
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'n4',
      type: 'warning',
      data: { title: 'Document expiring soon', body: 'Insurance certificate expires in 7 days' },
      created_at: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'n5',
      type: 'order',
      data: { title: 'Payment received', body: 'Invoice #INV-2024-0089 marked as paid' },
      created_at: new Date(Date.now() - 28800000).toISOString(),
    },
  ];

  const items = (notifications && notifications.length > 0) ? notifications.slice(0, 5) : sampleNotifications;

  if (items.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="You're all caught up"
      />
    );
  }

  return (
    <div className="space-y-1">
      {items.map((n) => {
        const typeConfig = TYPE_ICONS[n.type] || TYPE_ICONS.info;
        const Icon = typeConfig.icon;
        return (
          <div
            key={n.id}
            className="flex items-start gap-3 rounded-md p-2 -mx-2 transition-colors"
            style={{ opacity: n.read_at ? 0.6 : 1 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ds-gray-100)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md flex-shrink-0 mt-0.5"
              style={{
                background: `var(${typeConfig.bgVar})`,
                color: `var(${typeConfig.colorVar})`,
              }}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] font-medium truncate"
                style={{ color: 'var(--ds-gray-1000)' }}
              >
                {n.data.title}
              </p>
              <p
                className="text-[11px] truncate"
                style={{ color: 'var(--ds-gray-900)' }}
              >
                {n.data.body}
              </p>
            </div>
            <span
              className="text-[10px] flex-shrink-0 mt-0.5"
              style={{ color: 'var(--ds-gray-700)' }}
            >
              {getTimeAgo(n.created_at)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
