'use client';

import { useDashboardStore } from '@/stores/dashboardStore';
import type { WidgetType } from '@/stores/dashboardStore';
import { Modal } from '@/components/ui/Modal';
import Switch from '@/components/ui/Switch';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  TruckIcon,
  ChartPieIcon,
  CurrencyEuroIcon,
  MapIcon,
  BoltIcon,
  BellIcon,
  GlobeAltIcon,
  BeakerIcon,
  CheckBadgeIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

const WIDGET_META: Record<WidgetType, { icon: typeof ChartBarIcon; description: string; colorVar: string; bgVar: string }> = {
  stats_overview: {
    icon: ChartBarIcon,
    description: 'Key metrics: freight, vehicles, orders, shipments',
    colorVar: '--ds-blue-900',
    bgVar: '--ds-blue-200',
  },
  recent_orders: {
    icon: ClipboardDocumentListIcon,
    description: 'Latest transport orders with status',
    colorVar: '--ds-green-900',
    bgVar: '--ds-green-200',
  },
  active_shipments: {
    icon: TruckIcon,
    description: 'Active shipments with progress tracking',
    colorVar: '--ds-amber-900',
    bgVar: '--ds-amber-200',
  },
  freight_chart: {
    icon: ChartPieIcon,
    description: 'Bar chart of freight offers per day',
    colorVar: '--ds-purple-900',
    bgVar: '--ds-purple-200',
  },
  revenue_chart: {
    icon: CurrencyEuroIcon,
    description: 'Revenue trend with area chart',
    colorVar: '--ds-green-900',
    bgVar: '--ds-green-200',
  },
  map_overview: {
    icon: MapIcon,
    description: 'Fleet positions on an interactive map',
    colorVar: '--ds-blue-900',
    bgVar: '--ds-blue-200',
  },
  quick_actions: {
    icon: BoltIcon,
    description: 'Shortcuts to frequent actions',
    colorVar: '--ds-amber-900',
    bgVar: '--ds-amber-200',
  },
  notifications: {
    icon: BellIcon,
    description: 'Recent notifications and alerts',
    colorVar: '--ds-red-900',
    bgVar: '--ds-red-200',
  },
  market_barometer: {
    icon: GlobeAltIcon,
    description: 'Market supply/demand index and pricing',
    colorVar: '--ds-blue-900',
    bgVar: '--ds-blue-200',
  },
  carbon_footprint: {
    icon: BeakerIcon,
    description: 'CO₂ emissions gauge with targets',
    colorVar: '--ds-green-900',
    bgVar: '--ds-green-200',
  },
  pending_tasks: {
    icon: CheckBadgeIcon,
    description: 'Actionable checklist of pending items',
    colorVar: '--ds-amber-900',
    bgVar: '--ds-amber-200',
  },
  company_performance: {
    icon: BuildingOffice2Icon,
    description: 'Company rating and performance metrics',
    colorVar: '--ds-purple-900',
    bgVar: '--ds-purple-200',
  },
};

export function WidgetPicker() {
  const { widgets, isPickerOpen, setPickerOpen, toggleWidget } = useDashboardStore();

  return (
    <Modal
      open={isPickerOpen}
      onClose={() => setPickerOpen(false)}
      title="Add Widgets"
      description="Toggle widgets to customize your dashboard layout"
      size="lg"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {widgets.map((widget) => {
          const meta = WIDGET_META[widget.type];
          if (!meta) return null;
          const Icon = meta.icon;

          return (
            <div
              key={widget.id}
              className="flex items-center gap-3 rounded-lg p-3 transition-colors"
              style={{
                background: widget.visible ? 'var(--ds-gray-100)' : 'transparent',
                border: '1px solid var(--ds-gray-200)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  background: `var(${meta.bgVar})`,
                  color: `var(${meta.colorVar})`,
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium truncate"
                  style={{ color: 'var(--ds-gray-1000)' }}
                >
                  {widget.title}
                </p>
                <p
                  className="text-[11px] truncate"
                  style={{ color: 'var(--ds-gray-900)' }}
                >
                  {meta.description}
                </p>
              </div>
              <Switch
                checked={widget.visible}
                onChange={() => toggleWidget(widget.id)}
                size="sm"
              />
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
