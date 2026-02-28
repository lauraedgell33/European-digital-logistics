'use client';

import { useDashboard } from '@/hooks/useApi';
import { StatusBadge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import type { Shipment } from '@/types';
import Link from 'next/link';

export function ActiveShipmentsWidget() {
  const { data: dashboard, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton-geist h-2 w-2 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton-geist h-3.5 w-28" />
              <div className="skeleton-geist h-3 w-40" />
            </div>
            <div className="skeleton-geist h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const shipments = (dashboard?.active_shipments || []).slice(0, 5);

  if (shipments.length === 0) {
    return (
      <EmptyState
        title="No active shipments"
        description="Active shipments will appear here"
      />
    );
  }

  return (
    <div className="space-y-3">
      {shipments.map((shipment: Shipment) => {
        const progress = shipment.total_distance_km && shipment.remaining_distance_km
          ? Math.round(((shipment.total_distance_km - shipment.remaining_distance_km) / shipment.total_distance_km) * 100)
          : null;

        return (
          <Link
            key={shipment.id}
            href={`/tracking?code=${shipment.tracking_code}`}
            className="block rounded-md p-2 -mx-2 transition-colors no-underline"
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ds-gray-100)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-2 w-2 rounded-full animate-pulse-dot flex-shrink-0"
                style={{ background: 'var(--ds-green-700)' }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-mono truncate"
                  style={{ color: 'var(--ds-gray-1000)' }}
                >
                  {shipment.tracking_code}
                </p>
                <p className="text-[11px] truncate" style={{ color: 'var(--ds-gray-900)' }}>
                  {shipment.current_location_name || 'Location updating...'}
                </p>
              </div>
              <StatusBadge status={shipment.status} />
            </div>
            {progress !== null && (
              <div className="mt-2 ml-5">
                <div
                  className="h-1.5 rounded-full w-full overflow-hidden"
                  style={{ background: 'var(--ds-gray-200)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      background: 'var(--ds-blue-700)',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px]" style={{ color: 'var(--ds-gray-900)' }}>
                    {progress}% complete
                  </span>
                  {shipment.eta && (
                    <span className="text-[10px]" style={{ color: 'var(--ds-gray-900)' }}>
                      ETA: {new Date(shipment.eta).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </Link>
        );
      })}
      <div className="pt-1">
        <Link
          href="/tracking"
          className="text-[12px] font-medium no-underline"
          style={{ color: 'var(--ds-blue-900)' }}
        >
          View all shipments →
        </Link>
      </div>
    </div>
  );
}
