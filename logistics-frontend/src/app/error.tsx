'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--geist-background)' }}>
      <div className="text-center max-w-md animate-fade-in-up">
        {/* Error Visual */}
        <div className="mb-8">
          <div className="relative inline-flex">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto">
              <circle cx="40" cy="40" r="36" stroke="var(--ds-red-400)" strokeWidth="2" />
              <circle cx="40" cy="40" r="36" stroke="var(--ds-red-700)" strokeWidth="2" strokeDasharray="226" strokeDashoffset="170" className="animate-spin-slow" style={{ transformOrigin: '40px 40px' }} />
              <path d="M40 24v18" stroke="var(--ds-red-700)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="40" cy="52" r="2" fill="var(--ds-red-700)" />
            </svg>
          </div>
        </div>

        <h1 
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--ds-gray-1000)' }}
        >
          Something went wrong
        </h1>
        <p 
          className="text-[14px] mb-2"
          style={{ color: 'var(--ds-gray-800)' }}
        >
          An unexpected error occurred. Our team has been notified.
        </p>

        {error.digest && (
          <p 
            className="text-[12px] font-mono mb-6"
            style={{ color: 'var(--ds-gray-600)' }}
          >
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 mt-6">
          <button 
            onClick={reset}
            className="btn-geist btn-geist-primary"
          >
            Try again
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="btn-geist btn-geist-secondary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
