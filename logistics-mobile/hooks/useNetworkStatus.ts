import { useEffect, useState, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? true);
      setConnectionType(state.type);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, connectionType };
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<Array<{ key: string; action: () => Promise<void> }>>([]);
  const { isConnected } = useNetworkStatus();

  const addToQueue = useCallback((key: string, action: () => Promise<void>) => {
    setQueue((prev) => [...prev, { key, action }]);
  }, []);

  useEffect(() => {
    if (isConnected && queue.length > 0) {
      const processQueue = async () => {
        const currentQueue = [...queue];
        setQueue([]);
        for (const item of currentQueue) {
          try {
            await item.action();
          } catch (err) {
            console.warn('Failed to process queued action:', item.key, err);
          }
        }
      };
      processQueue();
    }
  }, [isConnected, queue]);

  return { addToQueue, queueSize: queue.length, isConnected };
}
