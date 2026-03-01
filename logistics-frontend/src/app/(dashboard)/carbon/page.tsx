import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carbon Calculator | LogiMarket',
  description: 'Calculate and monitor CO₂ emissions for your transport operations with EN 16258 compliant carbon footprint analysis.',
};

const CarbonClient = dynamic(() => import('./CarbonClient'), {
  ssr: false,
});

function CarbonLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 rounded" style={{ background: 'var(--ds-gray-300)' }} />
          <div className="h-4 w-64 rounded mt-2" style={{ background: 'var(--ds-gray-200)' }} />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded" style={{ background: 'var(--ds-gray-200)' }} />
          <div className="h-9 w-28 rounded" style={{ background: 'var(--ds-gray-200)' }} />
        </div>
      </div>
      <div className="h-80 rounded-xl" style={{ background: 'var(--ds-gray-200)' }} />
    </div>
  );
}

export default function CarbonPage() {
  return (
    <Suspense fallback={<CarbonLoading />}>
      <CarbonClient />
    </Suspense>
  );
}
