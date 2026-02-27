import { create } from 'zustand';
import { TrackingPosition, Shipment } from '@/types';

interface TrackingState {
  activeShipments: Shipment[];
  selectedShipment: Shipment | null;
  positions: Record<string, TrackingPosition[]>;
  isConnected: boolean;
  setActiveShipments: (shipments: Shipment[]) => void;
  selectShipment: (shipment: Shipment | null) => void;
  addPosition: (shipmentId: number, position: TrackingPosition) => void;
  setConnected: (connected: boolean) => void;
  updateShipment: (shipment: Shipment) => void;
}

export const useTrackingStore = create<TrackingState>()((set) => ({
  activeShipments: [],
  selectedShipment: null,
  positions: {},
  isConnected: false,

  setActiveShipments: (shipments) => set({ activeShipments: shipments }),

  selectShipment: (shipment) => set({ selectedShipment: shipment }),

  addPosition: (shipmentId, position) =>
    set((state) => ({
      positions: {
        ...state.positions,
        [shipmentId]: [...(state.positions[shipmentId] || []), position],
      },
    })),

  setConnected: (connected) => set({ isConnected: connected }),

  updateShipment: (shipment) =>
    set((state) => ({
      activeShipments: state.activeShipments.map((s) =>
        s.id === shipment.id ? shipment : s
      ),
      selectedShipment:
        state.selectedShipment?.id === shipment.id
          ? shipment
          : state.selectedShipment,
    })),
}));
