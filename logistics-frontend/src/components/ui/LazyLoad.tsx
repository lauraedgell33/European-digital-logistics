'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from './Loading';

interface LazyLoadProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function LazyLoad({ fallback, children }: LazyLoadProps) {
  return (
    <Suspense fallback={fallback || <Skeleton className="w-full h-48" />}>
      {children}
    </Suspense>
  );
}

// Lazy import helper with retry
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        return await factory();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
    throw new Error('Failed to load component');
  });
}
