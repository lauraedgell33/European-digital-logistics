import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { notificationApi } from './api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// Register for push notifications
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Get Expo push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with actual EAS project ID
    });
    const token = tokenData.data;

    // Register token with backend
    try {
      await notificationApi.registerDevice({
        token,
        platform: Platform.OS,
        device_name: Device.deviceName || 'Unknown',
      });
    } catch (e) {
      console.log('Failed to register push token with backend:', e);
    }

    return token;
  } catch (e) {
    console.log('Failed to get push token:', e);
    return null;
  }
}

// Set up Android notification channel
export async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1e40af',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Orders',
      description: 'Order status updates and new orders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      description: 'New messages and conversations',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('tracking', {
      name: 'Tracking',
      description: 'Shipment tracking updates',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

// Handle notification taps
export function setupNotificationListeners() {
  // When notification is tapped while app is foregrounded/backgrounded
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;

    if (data?.type === 'order' && data?.orderId) {
      router.push(`/(tabs)/orders/${data.orderId}` as any);
    } else if (data?.type === 'message' && data?.conversationId) {
      router.push(`/(tabs)/messages/${data.conversationId}` as any);
    } else if (data?.type === 'tracking' && data?.shipmentId) {
      router.push(`/tracking/${data.shipmentId}` as any);
    } else if (data?.type === 'freight' && data?.freightId) {
      router.push(`/(tabs)/marketplace/freight/${data.freightId}` as any);
    }
  });

  return subscription;
}

// Schedule a local notification
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  seconds: number = 1
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: seconds > 0 ? { seconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL } : null,
  });
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

// Set badge count
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

// Cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
