'use client';

import { useDashboard, useAnalytics } from '@/hooks/useApi';
import { StatCard, Card, CardHeader, SkeletonCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { SkeletonCard as SkeletonLoader } from '@/components/ui/Loading';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';
import AnimatedNumber, { AnimatedCurrency } from '@/components/ui/AnimatedNumber';
import EmptyState from '@/components/ui/EmptyState';
import type { TransportOrder, Shipment } from '@/types';
import {
  CubeIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  GlobeEuropeAfricaIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useDashboard();
  const { data: analytics } = useAnalytics('6');

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--ds-gray-1000)' }}
          >
            Dashboard
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
            Loading your logistics overview...
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--ds-gray-1000)' }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-[14px]" style={{ color: 'var(--ds-gray-900)' }}>
          European Digital Logistics Marketplace overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Freight"
          value={dashboard?.active_freight || 0}
          change="+12% from last month"
          changeType="positive"
          icon={<CubeIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Available Vehicles"
          value={dashboard?.available_vehicles || 0}
          change="+5% from last month"
          changeType="positive"
          icon={<TruckIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Active Orders"
          value={dashboard?.active_orders || 0}
          change="3 pending"
          changeType="neutral"
          icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Shipments In Transit"
          value={dashboard?.shipments_in_transit || 0}
          change="All on schedule"
          changeType="positive"
          icon={<MapPinIcon className="h-5 w-5" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent Transport Orders"
              description="Latest orders across all carriers"
              action={
                <Link
                  href="/orders"
                  className="btn-geist btn-geist-secondary btn-geist-sm no-underline"
                >
                  View all
                </Link>
              }
            />
            <div className="mt-4 space-y-0">
              {(dashboard?.recent_orders || []).slice(0, 6).map((order: TransportOrder) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 transition-colors"
                  style={{ borderBottom: '1px solid var(--ds-gray-200)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-md"
                      style={{ background: 'var(--ds-gray-200)' }}
                    >
                      <ClipboardDocumentListIcon
                        className="h-4 w-4"
                        style={{ color: 'var(--ds-gray-900)' }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-[13px] font-medium"
                        style={{ color: 'var(--ds-gray-1000)' }}
                      >
                        {order.order_number}
                      </p>
                      <p className="text-[12px]" style={{ color: 'var(--ds-gray-900)' }}>
                        {order.pickup_city} → {order.delivery_city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: 'var(--ds-gray-1000)' }}
                    >
                      {formatCurrency(order.total_price || 0)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
              {(!dashboard?.recent_orders || dashboard.recent_orders.length === 0) && (
                <EmptyState
                  title="No recent orders"
                  description="Your transport orders will appear here"
                  action={{ label: 'Create Order', onClick: () => {} }}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions & Active Shipments */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader title="Quick Actions" />
            <div className="mt-3 space-y-2">
              <Link
                href="/freight/new"
                className="flex items-center gap-3 rounded-md p-2.5 transition-colors no-underline"
                style={{ color: 'var(--ds-gray-1000)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ds-gray-100)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ background: 'var(--ds-blue-200)', color: 'var(--ds-blue-900)' }}
                >
                  <CubeIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">Post Freight</p>
                  <p className="text-[11px]" style={{ color: 'var(--ds-gray-900)' }}>
                    Create a new freight offer
                  </p>
                </div>
              </Link>
              <Link
                href="/vehicles/new"
                className="flex items-center gap-3 rounded-md p-2.5 transition-colors no-underline"
                style={{ color: 'var(--ds-gray-1000)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ds-gray-100)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ background: 'var(--ds-green-200)', color: 'var(--ds-green-900)' }}
                >
                  <TruckIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">Register Vehicle</p>
                  <p className="text-[11px]" style={{ color: 'var(--ds-gray-900)' }}>
                    Add available vehicle capacity
                  </p>
                </div>
              </Link>
              <Link
                href="/tracking"
                className="flex items-center gap-3 rounded-md p-2.5 transition-colors no-underline"
                style={{ color: 'var(--ds-gray-1000)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ds-gray-100)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ background: 'var(--ds-amber-200)', color: 'var(--ds-amber-900)' }}
                >
                  <GlobeEuropeAfricaIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">Track Shipments</p>
                  <p className="text-[11px]" style={{ color: 'var(--ds-gray-900)' }}>
                    Real-time shipment monitoring
                  </p>
                </div>
              </Link>
            </div>
          </Card>

          {/* Active Shipments Summary */}
          <Card>
            <CardHeader title="Active Shipments" />
            <div className="mt-3 space-y-3">
              {(dashboard?.active_shipments || []).slice(0, 4).map((shipment: Shipment) => (
                <div key={shipment.id} className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-full animate-pulse-dot"
                    style={{ background: 'var(--ds-green-700)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[13px] font-mono truncate"
                      style={{ color: 'var(--ds-gray-1000)' }}
                    >
                      {shipment.tracking_code}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--ds-gray-900)' }}>
                      {shipment.current_location_name || 'Location updating...'}
                    </p>
                  </div>
                  <StatusBadge status={shipment.status} />
                </div>
              ))}
              {(!dashboard?.active_shipments || dashboard.active_shipments.length === 0) && (
                <EmptyState
                  title="No active shipments"
                  description="Active shipments will appear here"
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Revenue Overview */}
      {analytics && (
        <Card>
          <CardHeader
            title="Revenue Overview"
            description="Monthly transport revenue summary"
            action={
              <Link
                href="/analytics"
                className="btn-geist btn-geist-secondary btn-geist-sm no-underline"
              >
                <ArrowTrendingUpIcon className="h-4 w-4" />
                Full Analytics
              </Link>
            }
          />
          <div className="mt-6 grid grid-cols-3 gap-6">
            <div>
              <p className="text-[12px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
                Total Revenue
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: 'var(--ds-gray-1000)' }}
              >
                <AnimatedCurrency value={analytics?.total_revenue || 0} currency="EUR" />
              </p>
            </div>
            <div>
              <p className="text-[12px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
                Completed Orders
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: 'var(--ds-gray-1000)' }}
              >
                <AnimatedNumber value={analytics?.completed_orders || 0} />
              </p>
            </div>
            <div>
              <p className="text-[12px] font-medium" style={{ color: 'var(--ds-gray-900)' }}>
                Avg. Order Value
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: 'var(--ds-gray-1000)' }}
              >
                <AnimatedCurrency value={analytics?.avg_order_value || 0} currency="EUR" />
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
