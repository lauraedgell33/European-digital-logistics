'use client';

/**
 * Page loading skeleton for lazy-loaded dashboard pages
 */
export default function PageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in" role="status" aria-label="Loading page">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div
          className="h-8 w-48 rounded-md skeleton-geist"
        />
        <div
          className="h-4 w-72 rounded-md skeleton-geist"
        />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg p-5"
            style={{
              background: 'var(--ds-background-200)',
              border: '1px solid var(--ds-gray-400)',
            }}
          >
            <div className="h-3 w-24 rounded skeleton-geist mb-3" />
            <div className="h-7 w-16 rounded skeleton-geist mb-2" />
            <div className="h-3 w-32 rounded skeleton-geist" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div
        className="rounded-lg p-6"
        style={{
          background: 'var(--ds-background-200)',
          border: '1px solid var(--ds-gray-400)',
        }}
      >
        <div className="h-5 w-40 rounded skeleton-geist mb-2" />
        <div className="h-3 w-64 rounded skeleton-geist mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-md skeleton-geist"
              style={{ animationDelay: `${i * 75}ms` }}
            />
          ))}
        </div>
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
}
