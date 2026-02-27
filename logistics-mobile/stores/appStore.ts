import { create } from 'zustand';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  duration?: number;
}

interface AppState {
  notifications: ToastNotification[];
  unreadCount: number;
  locale: string;
  addNotification: (notification: Omit<ToastNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setUnreadCount: (count: number) => void;
  setLocale: (locale: string) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  locale: 'en',

  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification = { ...notification, id };
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
    const duration = notification.duration || 4000;
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, duration);
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),
  setLocale: (locale) => set({ locale }),
}));
