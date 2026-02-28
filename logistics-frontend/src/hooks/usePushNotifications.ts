'use client';

import { useState, useEffect, useCallback } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

interface PushNotificationData {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  actions?: Array<{ action: string; title: string }>;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      getExistingSubscription();
    }
  }, []);

  const getExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (err) {
      console.error('[Push] Error getting subscription:', err);
    }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) return null;
    setIsLoading(true);

    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setIsLoading(false);
        return null;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      setSubscription(sub);

      // Send subscription to backend
      await sendSubscriptionToServer(sub);

      setIsLoading(false);
      return sub;
    } catch (err) {
      console.error('[Push] Subscription failed:', err);
      setIsLoading(false);
      return null;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    setIsLoading(true);

    try {
      await subscription.unsubscribe();
      await removeSubscriptionFromServer(subscription);
      setSubscription(null);
    } catch (err) {
      console.error('[Push] Unsubscribe failed:', err);
    }

    setIsLoading(false);
  }, [subscription]);

  const sendLocalNotification = useCallback(async (data: PushNotificationData) => {
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'logimarket',
      data: { url: data.url || '/dashboard' },
      ...(data.actions ? { actions: data.actions } : {}),
    } as NotificationOptions);
  }, [permission]);

  return {
    isSupported,
    permission,
    subscription,
    isLoading,
    subscribe,
    unsubscribe,
    sendLocalNotification,
  };
}

// Helper: Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Send subscription to backend API
async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/push-subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        },
      }),
    });
  } catch (err) {
    console.error('[Push] Failed to send subscription to server:', err);
  }
}

// Remove subscription from backend
async function removeSubscriptionFromServer(subscription: PushSubscription) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/push-unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  } catch (err) {
    console.error('[Push] Failed to remove subscription from server:', err);
  }
}
