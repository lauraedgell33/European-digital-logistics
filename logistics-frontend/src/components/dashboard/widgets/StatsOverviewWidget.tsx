'use client';

import { useDashboard } from '@/hooks/useApi';
import { StatCard } from '@/components/ui/Card';
import {
  CubeIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export function StatsOverviewWidget() {
  const { data: dashboard, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCard key={i} title="" value="" loading />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Freight"
        value={dashboard?.active_freight ?? dashboard?.overview?.active_freight_offers ?? 0}
        change="+12% from last month"
        changeType="positive"
        icon={<CubeIcon className="h-5 w-5" />}
      />
      <StatCard
        title="Available Vehicles"
        value={dashboard?.available_vehicles ?? dashboard?.overview?.active_vehicle_offers ?? 0}
        change="+5% from last month"
        changeType="positive"
        icon={<TruckIcon className="h-5 w-5" />}
      />
      <StatCard
        title="Active Orders"
        value={dashboard?.active_orders ?? dashboard?.overview?.active_orders ?? 0}
        change="3 pending"
        changeType="neutral"
        icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
      />
      <StatCard
        title="Shipments In Transit"
        value={dashboard?.shipments_in_transit ?? dashboard?.overview?.active_shipments ?? 0}
        change="All on schedule"
        changeType="positive"
        icon={<MapPinIcon className="h-5 w-5" />}
      />
    </div>
  );
}
