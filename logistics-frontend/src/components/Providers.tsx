'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { connectWebSocket, disconnectWebSocket, setQueryClient, subscribeToUserNotifications, subscribeToCompany } from '@/lib/websocket';
import { NotificationContainer } from '@/components/ui/Notification';
import ThemeProvider from '@/components/providers/ThemeProvider';
import { LocaleSync } from '@/components/LocaleSync';
import { SeoHead } from '@/components/SeoHead';
import dynamic from 'next/dynamic';

const CommandPalette = dynamic(() => import('@/components/ui/CommandPalette'), {
  ssr: false,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 60s — logistics data doesn't change rapidly
      retry: 3, // mobile/logistics users have intermittent connectivity
      retryDelay: (attemptIndex: number) =>
        Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleSync />
        <SeoHead />
        <WebSocketProvider />
        <NotificationContainer />
        <CommandPalette />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function WebSocketProvider() {
  const { token, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Register query client so WebSocket handlers can invalidate caches
    setQueryClient(queryClient);
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      connectWebSocket(token);

      // Subscribe to user-specific and company-wide channels
      if (user?.id) {
        subscribeToUserNotifications(user.id);
      }
      if (user?.company_id) {
        subscribeToCompany(user.company_id);
      }
    }
    return () => disconnectWebSocket();
  }, [isAuthenticated, token, user?.id, user?.company_id]);

  return null;
}
