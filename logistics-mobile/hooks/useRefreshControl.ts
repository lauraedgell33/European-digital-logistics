import { useState, useCallback } from 'react';

interface UseRefreshControlOptions {
  onRefresh: () => Promise<void>;
}

interface UseRefreshControlResult {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

export function useRefreshControl({
  onRefresh,
}: UseRefreshControlOptions): UseRefreshControlResult {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.warn('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshing]);

  return { refreshing, onRefresh: handleRefresh };
}
