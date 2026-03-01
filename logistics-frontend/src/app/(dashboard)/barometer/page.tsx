import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Barometer | LogiMarket',
  description: 'Real-time European freight market barometer with supply/demand ratios, price trends, and top route analytics.',
};

const BarometerClient = dynamic(() => import('./BarometerClient'), {
  ssr: false,
});

function BarometerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-52 rounded" style={{ background: 'var(--ds-gray-300)' }} />
        <div className="h-4 w-72 rounded mt-2" style={{ background: 'var(--ds-gray-200)' }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl" style={{ background: 'var(--ds-gray-200)' }} />
        ))}
      </div>
      <div className="h-64 rounded-xl" style={{ background: 'var(--ds-gray-200)' }} />
    </div>
  );
}

export default function BarometerPage() {
  return (
    <Suspense fallback={<BarometerLoading />}>
      <BarometerClient />
    </Suspense>
  );
}
