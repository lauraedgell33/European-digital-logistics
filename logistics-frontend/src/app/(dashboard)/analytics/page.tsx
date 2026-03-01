import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | LogiMarket',
  description: 'Business analytics, revenue insights, and performance metrics for your logistics operations.',
};

const AnalyticsClient = dynamic(() => import('./AnalyticsClient'), {
  ssr: false,
});

function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 rounded" style={{ background: 'var(--ds-gray-300)' }} />
          <div className="h-4 w-64 rounded mt-2" style={{ background: 'var(--ds-gray-200)' }} />
        </div>
        <div className="h-9 w-36 rounded" style={{ background: 'var(--ds-gray-200)' }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl" style={{ background: 'var(--ds-gray-200)' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-xl" style={{ background: 'var(--ds-gray-200)' }} />
        <div className="h-72 rounded-xl" style={{ background: 'var(--ds-gray-200)' }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsClient />
    </Suspense>
  );
}
