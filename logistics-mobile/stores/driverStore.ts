import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface DeliveryTask {
  id: number;
  order_id: number;
  order_number: string;
  type: 'pickup' | 'delivery';
  status: 'pending' | 'en_route' | 'arrived' | 'completed' | 'failed';
  company_name: string;
  contact_name?: string;
  contact_phone?: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  lat?: number;
  lng?: number;
  scheduled_date: string;
  scheduled_time?: string;
  cargo_description?: string;
  weight?: number;
  pallet_count?: number;
  notes?: string;
  pod_photos?: string[];
  pod_signature?: string;
  completed_at?: string;
}

export interface OfflineActionPayload {
  status?: string;
  notes?: string;
  location?: string;
  lat?: number;
  lng?: number;
  photo_uri?: string;
  signature?: string;
  signed_at?: string;
  role?: string;
  task_id?: number;
  order_id?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface OfflineAction {
  id: string;
  type: 'update_status' | 'upload_pod' | 'sign_ecmr' | 'update_location';
  payload: OfflineActionPayload;
  created_at: string;
  synced: boolean;
}

interface DriverState {
  tasks: DeliveryTask[];
  currentTask: DeliveryTask | null;
  offlineQueue: OfflineAction[];
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  currentLat: number | null;
  currentLng: number | null;

  setTasks: (tasks: DeliveryTask[]) => void;
  setCurrentTask: (task: DeliveryTask | null) => void;
  updateTaskStatus: (taskId: number, status: DeliveryTask['status']) => void;
  addPodPhoto: (taskId: number, photoUri: string) => void;
  completeTask: (taskId: number, signature?: string) => void;
  addOfflineAction: (action: Omit<OfflineAction, 'id' | 'created_at' | 'synced'>) => void;
  setOnlineStatus: (online: boolean) => void;
  setLocation: (lat: number, lng: number) => void;
  syncOfflineQueue: () => Promise<void>;
  hydrate: () => Promise<void>;
  persistState: () => Promise<void>;
}

export const useDriverStore = create<DriverState>()((set, get) => ({
  tasks: [],
  currentTask: null,
  offlineQueue: [],
  isOnline: true,
  isSyncing: false,
  lastSyncAt: null,
  currentLat: null,
  currentLng: null,

  setTasks: (tasks) => {
    set({ tasks });
    get().persistState();
  },

  setCurrentTask: (task) => set({ currentTask: task }),

  updateTaskStatus: (taskId, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status } : t
      ),
      currentTask:
        state.currentTask?.id === taskId
          ? { ...state.currentTask, status }
          : state.currentTask,
    }));

    const { isOnline } = get();
    if (!isOnline) {
      get().addOfflineAction({
        type: 'update_status',
        payload: { taskId, status },
      });
    }
    get().persistState();
  },

  addPodPhoto: (taskId, photoUri) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, pod_photos: [...(t.pod_photos || []), photoUri] }
          : t
      ),
    }));
    get().persistState();
  },

  completeTask: (taskId, signature) => {
    const now = new Date().toISOString();
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'completed' as const, completed_at: now, pod_signature: signature }
          : t
      ),
      currentTask: null,
    }));

    const { isOnline } = get();
    if (!isOnline) {
      get().addOfflineAction({
        type: 'upload_pod',
        payload: { taskId, signature, completed_at: now },
      });
    }
    get().persistState();
  },

  addOfflineAction: (action) => {
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      synced: false,
    };
    set((state) => ({
      offlineQueue: [...state.offlineQueue, newAction],
    }));
    get().persistState();
  },

  setOnlineStatus: (online) => {
    set({ isOnline: online });
    if (online) {
      get().syncOfflineQueue();
    }
  },

  setLocation: (lat, lng) => set({ currentLat: lat, currentLng: lng }),

  syncOfflineQueue: async () => {
    const { offlineQueue, isSyncing } = get();
    if (isSyncing || offlineQueue.length === 0) return;

    set({ isSyncing: true });
    const remaining: OfflineAction[] = [];

    for (const action of offlineQueue) {
      if (action.synced) continue;
      try {
        // In production, this would call the API
        // For now, mark as synced
        action.synced = true;
      } catch {
        remaining.push(action);
      }
    }

    set({
      offlineQueue: remaining,
      isSyncing: false,
      lastSyncAt: new Date().toISOString(),
    });
    get().persistState();
  },

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem('driver_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          tasks: parsed.tasks || [],
          offlineQueue: parsed.offlineQueue || [],
          lastSyncAt: parsed.lastSyncAt,
        });
      }

      const netState = await NetInfo.fetch();
      set({ isOnline: netState.isConnected ?? true });
    } catch {
      // ignore hydration errors
    }
  },

  persistState: async () => {
    try {
      const { tasks, offlineQueue, lastSyncAt } = get();
      await AsyncStorage.setItem(
        'driver_state',
        JSON.stringify({ tasks, offlineQueue, lastSyncAt })
      );
    } catch {
      // ignore persistence errors
    }
  },
}));
