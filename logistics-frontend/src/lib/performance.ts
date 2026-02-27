/**
 * Performance utilities for the logistics platform
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Create a lazily-loaded component with a loading placeholder
 */
export function lazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  _loadingComponent?: ComponentType
) {
  return dynamic(importFn, {
    loading: () => null,
    ssr: false,
  });
}

/**
 * Prefetch a route by creating a hidden link
 */
export function prefetchRoute(route: string) {
  if (typeof window === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
}

/**
 * Debounced search handler for API calls
 */
export function createDebouncedSearch(delay = 300) {
  let timeout: NodeJS.Timeout;
  return (callback: () => void) => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, delay);
  };
}

/**
 * Request idle callback polyfill
 */
export function requestIdleCallback(callback: () => void) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(callback);
  }
  return setTimeout(callback, 1);
}

/**
 * Measure component render performance
 */
export function measurePerformance(name: string) {
  if (typeof window === 'undefined' || !window.performance) return { end: () => {} };
  const start = performance.now();
  return {
    end: () => {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.debug(`⚡ [${name}] ${duration.toFixed(2)}ms`);
      }
    },
  };
}

/**
 * Batch DOM reads to avoid layout thrashing
 */
export function batchRead<T>(readFn: () => T): Promise<T> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve(readFn());
    });
  });
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Generate a stable hash from a string (for cache keys)
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
