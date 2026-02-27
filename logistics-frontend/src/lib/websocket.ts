import { io, Socket } from 'socket.io-client';
import { useTrackingStore } from '@/stores/trackingStore';
import { useAppStore } from '@/stores/appStore';
import type { QueryClient } from '@tanstack/react-query';
import type {
  ShipmentLocationEvent,
  OrderStatusEvent,
  NewMessageEvent,
  NewNotificationEvent,
  TrackingPosition,
  Shipment,
} from '@/types';

let socket: Socket | null = null;
let queryClient: QueryClient | null = null;

// Event listener registries for component-level subscriptions
type EventCallback = (data: unknown) => void;
const eventListeners: Record<string, Set<EventCallback>> = {};

/**
 * Set the React Query client for cache invalidation on real-time events.
 */
export function setQueryClient(client: QueryClient) {
  queryClient = client;
}

/**
 * Register a listener for a specific WebSocket event.
 */
export function onEvent(event: string, callback: EventCallback): () => void {
  if (!eventListeners[event]) {
    eventListeners[event] = new Set();
  }
  eventListeners[event].add(callback);

  // Return unsubscribe function
  return () => {
    eventListeners[event]?.delete(callback);
  };
}

function emitToListeners(event: string, data: unknown) {
  eventListeners[event]?.forEach((cb) => cb(data));
}

export function connectWebSocket(token: string) {
  if (socket?.connected) return;

  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:6001';

  socket = io(wsUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
    useTrackingStore.getState().setConnected(true);
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
    useTrackingStore.getState().setConnected(false);
  });

  // ── Shipment position updates ──────────────────────────
  socket.on('shipment.location.updated', (data: ShipmentLocationEvent & { position?: unknown; shipment?: unknown }) => {
    const store = useTrackingStore.getState();
    if (data.position) {
      store.addPosition(data.shipment_id, data.position as TrackingPosition);
    }
    if (data.shipment) {
      store.updateShipment(data.shipment as Shipment);
    }
    emitToListeners('shipment.location.updated', data);
  });

  socket.on('shipment.position.updated', (data: ShipmentLocationEvent & { position?: unknown }) => {
    const store = useTrackingStore.getState();
    if (data.position) {
      store.addPosition(data.shipment_id, data.position as TrackingPosition);
    }
    emitToListeners('shipment.position.updated', data);
  });

  // ── Order status changes ───────────────────────────────
  socket.on('order.status.changed', (data: OrderStatusEvent & { order_number?: string; previous_status?: string; new_status?: string }) => {
    // Invalidate orders queries so lists refresh
    queryClient?.invalidateQueries({ queryKey: ['orders'] });
    queryClient?.invalidateQueries({ queryKey: ['order', data.order_id] });
    queryClient?.invalidateQueries({ queryKey: ['statistics'] });

    // Show toast notification
    useAppStore.getState().addNotification({
      type: 'info',
      title: 'Order Updated',
      message: `Order ${data.order_number}: ${data.previous_status} → ${data.new_status}`,
    });

    emitToListeners('order.status.changed', data);
  });

  // ── New message received ───────────────────────────────
  socket.on('message.sent', (data: NewMessageEvent & { sender_name?: string; body?: string }) => {
    queryClient?.invalidateQueries({ queryKey: ['conversations'] });
    queryClient?.invalidateQueries({
      queryKey: ['messages', data.conversation_id],
    });
    queryClient?.invalidateQueries({ queryKey: ['unreadCount'] });

    // Show notification for messages from other users
    if (data.sender_name) {
      useAppStore.getState().addNotification({
        type: 'info',
        title: data.sender_name,
        message: (data.body || '').slice(0, 80),
      });
    }

    emitToListeners('message.sent', data);
  });

  // ── Generic notifications ──────────────────────────────
  socket.on('notification.new', (data: NewNotificationEvent & { message?: string }) => {
    queryClient?.invalidateQueries({ queryKey: ['notifications'] });

    useAppStore.getState().addNotification({
      type: 'info',
      title: data.title || 'New notification',
      message: data.message || '',
    });

    emitToListeners('notification.new', data);
  });

  socket.on('reconnect_failed', () => {
    console.error('WebSocket reconnection failed');
    useTrackingStore.getState().setConnected(false);
  });
}

export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    useTrackingStore.getState().setConnected(false);
  }
}

export function subscribeToShipment(shipmentId: number) {
  socket?.emit('subscribe', { channel: `shipment.${shipmentId}` });
}

export function unsubscribeFromShipment(shipmentId: number) {
  socket?.emit('unsubscribe', { channel: `shipment.${shipmentId}` });
}

export function subscribeToOrder(orderId: number) {
  socket?.emit('subscribe', { channel: `order.${orderId}` });
}

export function unsubscribeFromOrder(orderId: number) {
  socket?.emit('unsubscribe', { channel: `order.${orderId}` });
}

export function subscribeToConversation(conversationId: number) {
  socket?.emit('subscribe', { channel: `conversation.${conversationId}` });
}

export function unsubscribeFromConversation(conversationId: number) {
  socket?.emit('unsubscribe', { channel: `conversation.${conversationId}` });
}

export function subscribeToUserNotifications(userId: number) {
  socket?.emit('subscribe', { channel: `user.${userId}` });
}

export function subscribeToCompany(companyId: number) {
  socket?.emit('subscribe', { channel: `company.${companyId}` });
}

export function getSocket(): Socket | null {
  return socket;
}
