import { useState, useEffect, useMemo, useCallback, RefObject } from 'react';

interface UseVirtualScrollOptions<T> {
  items: T[];
  itemHeight: number;
  containerRef: RefObject<HTMLElement>;
  overscan?: number;
}

interface UseVirtualScrollResult<T> {
  visibleItems: { item: T; index: number }[];
  totalHeight: number;
  offsetY: number;
}

export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerRef,
  overscan = 5,
}: UseVirtualScrollOptions<T>): UseVirtualScrollResult<T> {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(container);
    container.addEventListener('scroll', handleScroll, { passive: true });
    setContainerHeight(container.clientHeight);

    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);

  const totalHeight = items.length * itemHeight;

  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);
    return { startIndex: start, endIndex: end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    const result: { item: T; index: number }[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i] !== undefined) {
        result.push({ item: items[i], index: i });
      }
    }
    return result;
  }, [items, startIndex, endIndex]);

  const offsetY = startIndex * itemHeight;

  return { visibleItems, totalHeight, offsetY };
}
