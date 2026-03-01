import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import Toast from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import OfflineBanner from '@/components/OfflineBanner';
import {
  registerForPushNotifications,
  setupAndroidChannel,
  setupNotificationListeners,
} from '@/lib/notifications';
import { useWebSocket } from '@/lib/websocket';
import { initSentry } from '@/lib/sentry';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';

// Initialize Sentry as early as possible
initSentry();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const { colors, isDark } = useThemeContext();

  // Initialize WebSocket connection
  useWebSocket();

  useEffect(() => {
    hydrate();

    // Setup push notifications
    setupAndroidChannel();
    registerForPushNotifications();
    const sub = setupNotificationListeners();
    return () => sub.remove();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tracking/[shipmentId]" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
