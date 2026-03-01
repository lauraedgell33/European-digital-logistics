import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warehouses | LogiMarket',
  description: 'Search and book warehouse space across Europe — cold storage, bonded, cross-dock, and more.',
};

const WarehousesClient = dynamic(() => import('./WarehousesClient'), {
  ssr: false,
});

function WarehousesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-40 rounded" style={{ background: 'var(--ds-gray-300)' }} />
        <div className="h-4 w-56 rounded mt-2" style={{ background: 'var(--ds-gray-200)' }} />
      </div>
      <div className="h-16 rounded-xl" style={{ background: 'var(--ds-gray-200)' }} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-56 rounded-xl" style={{ background: 'var(--ds-gray-200)' }} />
        ))}
      </div>
    </div>
  );
}

export default function WarehousesPage() {
  return (
    <Suspense fallback={<WarehousesLoading />}>
      <WarehousesClient />
    </Suspense>
  );
}
