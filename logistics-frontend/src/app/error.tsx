'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const sentryIdRef = useRef<string | undefined>();
  const [showDetails, setShowDetails] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    console.error('Application error:', error);
    const eventId = Sentry.captureException(error);
    sentryIdRef.current = eventId;
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--geist-background)' }}>
      <div className="text-center max-w-lg animate-fade-in-up">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="relative inline-flex">
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="mx-auto" aria-hidden="true">
              {/* Outer ring */}
              <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="1.5" className="text-red-200 dark:text-red-900" />
              {/* Animated progress arc */}
              <circle
                cx="48" cy="48" r="44"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="276"
                strokeDashoffset="200"
                className="text-red-500 dark:text-red-400 animate-spin"
                style={{ transformOrigin: '48px 48px', animationDuration: '3s' }}
              />
              {/* Inner shield / exclamation */}
              <rect x="36" y="28" width="24" height="40" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-red-400 dark:text-red-500" fill="none" />
              <path d="M48 38v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-red-600 dark:text-red-400" />
              <circle cx="48" cy="58" r="2" fill="currentColor" className="text-red-600 dark:text-red-400" />
            </svg>
          </div>
        </div>

        <h1
          className="text-2xl font-semibold mb-2"
          style={{ color: 'var(--ds-gray-1000)' }}
        >
          Something went wrong
        </h1>
        <p
          className="text-[14px] mb-4 max-w-sm mx-auto"
          style={{ color: 'var(--ds-gray-800)' }}
        >
          An unexpected error occurred. Our team has been notified and is looking into it.
        </p>

        {/* Sentry Error ID */}
        {(error.digest || sentryIdRef.current) && (
          <p
            className="text-[12px] font-mono mb-4 select-all"
            style={{ color: 'var(--ds-gray-600)' }}
          >
            Error ID: {error.digest || sentryIdRef.current}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => reset()}
            className="btn-geist btn-geist-primary"
          >
            <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try again
          </button>
          <Link
            href="/dashboard"
            className="btn-geist btn-geist-secondary"
          >
            <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
            </svg>
            Go home
          </Link>
        </div>

        {/* Dev-only: expandable error details */}
        {isDev && (
          <div className="mt-8 text-left">
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="text-xs font-medium underline"
              style={{ color: 'var(--ds-gray-700)' }}
            >
              {showDetails ? 'Hide' : 'Show'} error details
            </button>
            {showDetails && (
              <pre
                className="mt-2 p-3 rounded-md text-xs overflow-auto max-h-60 whitespace-pre-wrap break-words"
                style={{
                  background: 'var(--ds-gray-100)',
                  color: 'var(--ds-gray-900)',
                  border: '1px solid var(--ds-gray-300)',
                }}
              >
                <strong>{error.name}: {error.message}</strong>
                {'\n\n'}
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
