'use client';

import { useDashboardStore } from '@/stores/dashboardStore';
import type { WidgetType } from '@/stores/dashboardStore';
import { DashboardToolbar } from '@/components/dashboard/DashboardToolbar';
import { WidgetWrapper } from '@/components/dashboard/WidgetWrapper';
import { WidgetPicker } from '@/components/dashboard/WidgetPicker';
import {
  StatsOverviewWidget,
  RecentOrdersWidget,
  ActiveShipmentsWidget,
  FreightChartWidget,
  RevenueChartWidget,
  QuickActionsWidget,
  NotificationsWidget,
  MapOverviewWidget,
  MarketBarometerWidget,
  CarbonFootprintWidget,
  PendingTasksWidget,
  CompanyPerformanceWidget,
} from '@/components/dashboard/widgets';
import { useTranslation } from '@/hooks/useTranslation';

const WIDGET_COMPONENTS: Record<WidgetType, React.ComponentType> = {
  stats_overview: StatsOverviewWidget,
  recent_orders: RecentOrdersWidget,
  active_shipments: ActiveShipmentsWidget,
  freight_chart: FreightChartWidget,
  revenue_chart: RevenueChartWidget,
  quick_actions: QuickActionsWidget,
  notifications: NotificationsWidget,
  map_overview: MapOverviewWidget,
  market_barometer: MarketBarometerWidget,
  carbon_footprint: CarbonFootprintWidget,
  pending_tasks: PendingTasksWidget,
  company_performance: CompanyPerformanceWidget,
};

export default function DashboardPage() {
  const { widgets, isEditMode } = useDashboardStore();
  const { t } = useTranslation();
  const visibleWidgets = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4 animate-fade-in">
      <DashboardToolbar />

      {isEditMode && visibleWidgets.length === 0 && (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: 'var(--ds-gray-100)',
            border: '2px dashed var(--ds-gray-400)',
          }}
        >
          <p
            className="text-[14px] font-medium"
            style={{ color: 'var(--ds-gray-900)' }}
          >
            {t('dashboard.noData')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleWidgets.map((widget, index) => {
          const Component = WIDGET_COMPONENTS[widget.type];
          if (!Component) return null;
          return (
            <WidgetWrapper key={widget.id} widget={widget} index={index}>
              <Component />
            </WidgetWrapper>
          );
        })}
      </div>

      <WidgetPicker />
    </div>
  );
}
