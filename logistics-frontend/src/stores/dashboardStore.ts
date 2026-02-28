import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: number;
  visible: boolean;
  config?: Record<string, unknown>;
}

export type WidgetType =
  | 'stats_overview'
  | 'recent_orders'
  | 'active_shipments'
  | 'freight_chart'
  | 'revenue_chart'
  | 'map_overview'
  | 'quick_actions'
  | 'notifications'
  | 'market_barometer'
  | 'carbon_footprint'
  | 'pending_tasks'
  | 'company_performance';

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'w1', type: 'stats_overview', title: 'Statistics Overview', size: 'full', position: 0, visible: true },
  { id: 'w2', type: 'quick_actions', title: 'Quick Actions', size: 'medium', position: 1, visible: true },
  { id: 'w3', type: 'recent_orders', title: 'Recent Orders', size: 'medium', position: 2, visible: true },
  { id: 'w4', type: 'active_shipments', title: 'Active Shipments', size: 'medium', position: 3, visible: true },
  { id: 'w5', type: 'revenue_chart', title: 'Revenue Overview', size: 'large', position: 4, visible: true },
  { id: 'w6', type: 'freight_chart', title: 'Freight Activity', size: 'medium', position: 5, visible: true },
  { id: 'w7', type: 'notifications', title: 'Recent Notifications', size: 'medium', position: 6, visible: true },
  { id: 'w8', type: 'map_overview', title: 'Fleet Map', size: 'large', position: 7, visible: false },
  { id: 'w9', type: 'market_barometer', title: 'Market Barometer', size: 'medium', position: 8, visible: false },
  { id: 'w10', type: 'carbon_footprint', title: 'Carbon Footprint', size: 'small', position: 9, visible: false },
  { id: 'w11', type: 'pending_tasks', title: 'Pending Tasks', size: 'medium', position: 10, visible: false },
  { id: 'w12', type: 'company_performance', title: 'Company Performance', size: 'medium', position: 11, visible: false },
];

interface DashboardState {
  widgets: DashboardWidget[];
  isEditMode: boolean;
  isPickerOpen: boolean;
  setEditMode: (mode: boolean) => void;
  setPickerOpen: (open: boolean) => void;
  updateWidgets: (widgets: DashboardWidget[]) => void;
  toggleWidget: (id: string) => void;
  resizeWidget: (id: string, size: DashboardWidget['size']) => void;
  resetToDefault: () => void;
  moveWidget: (dragIndex: number, hoverIndex: number) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: DEFAULT_WIDGETS,
      isEditMode: false,
      isPickerOpen: false,
      setEditMode: (mode) => set({ isEditMode: mode }),
      setPickerOpen: (open) => set({ isPickerOpen: open }),
      updateWidgets: (widgets) => set({ widgets }),
      toggleWidget: (id) => {
        const widgets = get().widgets.map((w) =>
          w.id === id ? { ...w, visible: !w.visible } : w
        );
        set({ widgets });
      },
      resizeWidget: (id, size) => {
        const widgets = get().widgets.map((w) =>
          w.id === id ? { ...w, size } : w
        );
        set({ widgets });
      },
      resetToDefault: () => set({ widgets: DEFAULT_WIDGETS }),
      moveWidget: (dragIndex, hoverIndex) => {
        const widgets = [...get().widgets];
        const [removed] = widgets.splice(dragIndex, 1);
        widgets.splice(hoverIndex, 0, removed);
        set({ widgets: widgets.map((w, i) => ({ ...w, position: i })) });
      },
    }),
    { name: 'logimarket-dashboard-layout' }
  )
);
