import { useState, useCallback, useRef } from 'react';

interface UsePaginationOptions<T> {
  fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
  pageSize?: number;
}

interface UsePaginationResult<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  error: string | null;
}

export function usePagination<T>({
  fetchFn,
  pageSize = 20,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(1);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(pageRef.current);
      setData((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      pageRef.current += 1;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [fetchFn, hasMore]);

  const refresh = useCallback(async () => {
    pageRef.current = 1;
    isLoadingRef.current = false;
    setData([]);
    setHasMore(true);
    setError(null);
    setLoading(true);

    try {
      const result = await fetchFn(1);
      setData(result.data);
      setHasMore(result.hasMore);
      pageRef.current = 2;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  return { data, loading, hasMore, loadMore, refresh, error };
}
