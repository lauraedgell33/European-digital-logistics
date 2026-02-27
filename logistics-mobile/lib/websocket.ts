import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';

const WS_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:6001'
    : 'http://localhost:6001'
  : 'https://ws.logimarket.eu';

type EventHandler = (data: unknown) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  async connect() {
    if (this.socket?.connected) return;

    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) return;

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[WS] Connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      this.reconnectAttempts = attempt;
      console.log(`[WS] Reconnect attempt ${attempt}`);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[WS] Connection error:', err.message);
    });

    // Re-attach all stored listeners
    this.listeners.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket?.on(event, handler);
      });
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.reconnectAttempts = 0;
  }

  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    this.socket?.on(event, handler);
  }

  off(event: string, handler: EventHandler) {
    this.listeners.get(event)?.delete(handler);
    this.socket?.off(event, handler);
  }

  emit(event: string, data: unknown) {
    this.socket?.emit(event, data);
  }

  joinChannel(channel: string) {
    this.socket?.emit('subscribe', { channel });
  }

  leaveChannel(channel: string) {
    this.socket?.emit('unsubscribe', { channel });
  }

  get connected() {
    return this.socket?.connected ?? false;
  }
}

export const wsService = new WebSocketService();

/**
 * Hook to use WebSocket events with automatic cleanup.
 * Connects on mount, sets up event listeners for real-time updates,
 * and invalidates the appropriate query keys.
 */
export function useWebSocket() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { addNotification, setUnreadCount, unreadCount } = useAppStore();
  const socketRef = useRef(wsService);

  useEffect(() => {
    if (!user) return;

    const ws = socketRef.current;
    ws.connect();

    // Join user-specific channel
    ws.joinChannel(`user.${user.id}`);
    if (user.company_id) {
      ws.joinChannel(`company.${user.company_id}`);
    }

    // Order status changes
    const onOrderStatus = (data: unknown) => {
      const d = data as { order_id: number; status: string };
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', d.order_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      addNotification({
        type: 'info',
        title: `Order status: ${d.status.replace(/_/g, ' ')}`,
      });
    };

    // New message
    const onMessage = (data: unknown) => {
      const d = data as { conversation_id: number };
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', d.conversation_id] });
      setUnreadCount(unreadCount + 1);
    };

    // Notification
    const onNotification = (data: unknown) => {
      const d = data as { title: string };
      addNotification({ type: 'info', title: d.title });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    // Tracking update
    const onTracking = () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
    };

    // Tender update
    const onTenderUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
    };

    ws.on('order.status', onOrderStatus);
    ws.on('message.new', onMessage);
    ws.on('notification', onNotification);
    ws.on('tracking.update', onTracking);
    ws.on('tender.update', onTenderUpdate);

    return () => {
      ws.off('order.status', onOrderStatus);
      ws.off('message.new', onMessage);
      ws.off('notification', onNotification);
      ws.off('tracking.update', onTracking);
      ws.off('tender.update', onTenderUpdate);
      ws.leaveChannel(`user.${user.id}`);
      if (user.company_id) {
        ws.leaveChannel(`company.${user.company_id}`);
      }
    };
  }, [user?.id]);

  return socketRef.current;
}
