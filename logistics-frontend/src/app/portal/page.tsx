'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const RECENT_SEARCHES_KEY = 'portal_recent_searches';
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(trackingNumber: string) {
  const searches = getRecentSearches().filter((s) => s !== trackingNumber);
  searches.unshift(trackingNumber);
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES))
  );
}

function removeRecentSearch(trackingNumber: string) {
  const searches = getRecentSearches().filter((s) => s !== trackingNumber);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

export default function CustomerPortalPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const handleTrack = (code?: string) => {
    const value = (code || trackingNumber).trim();
    if (!value) return;
    addRecentSearch(value);
    router.push(`/portal/track?q=${encodeURIComponent(value)}`);
  };

  const handleRemoveRecent = (search: string) => {
    removeRecentSearch(search);
    setRecentSearches(getRecentSearches());
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--ds-blue-100)] via-[var(--ds-background-100)] to-[var(--ds-background-100)] dark:from-[hsl(212,50%,10%)] dark:via-[var(--ds-background-100)] dark:to-[var(--ds-background-100)]" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--ds-blue-200)] dark:bg-[hsl(212,40%,15%)] text-[var(--ds-blue-700)] text-xs font-medium mb-6">
            <MapPinIcon className="w-3.5 h-3.5" />
            Real-time shipment tracking
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--ds-gray-1000)] leading-tight mb-4">
            Track Your Shipment
          </h1>
          <p className="text-lg text-[var(--ds-gray-700)] mb-10 max-w-xl mx-auto">
            Enter your tracking number to get real-time updates on your shipment&apos;s location, status, and estimated delivery.
          </p>

          {/* Search box */}
          <div className="max-w-lg mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrack();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ds-gray-500)]" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g. SH-A1B2C3D4)"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--ds-gray-300)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-500)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-blue-700)] focus:border-transparent text-sm"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!trackingNumber.trim()}
                className="px-6 py-3 bg-[var(--ds-blue-700)] text-white font-medium rounded-lg hover:bg-[var(--ds-blue-800)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
              >
                Track
              </button>
            </form>
            <p className="text-xs text-[var(--ds-gray-500)] mt-3">
              Your tracking number starts with <span className="font-mono font-medium">SH-</span> followed by 8 characters.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
          <h2 className="text-sm font-medium text-[var(--ds-gray-700)] mb-3">Recent Searches</h2>
          <div className="space-y-2">
            {recentSearches.map((search) => (
              <div
                key={search}
                className="flex items-center justify-between p-3 rounded-lg border border-[var(--ds-gray-200)] hover:border-[var(--ds-gray-300)] bg-[var(--ds-background-100)] transition-colors group"
              >
                <button
                  onClick={() => handleTrack(search)}
                  className="flex items-center gap-3 text-left flex-1 min-w-0"
                >
                  <TruckIcon className="w-4 h-4 text-[var(--ds-gray-500)] shrink-0" />
                  <span className="text-sm font-mono text-[var(--ds-gray-1000)] truncate">{search}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRecent(search);
                  }}
                  className="p-1 rounded text-[var(--ds-gray-400)] hover:text-[var(--ds-red-700)] opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--ds-blue-100)] dark:bg-[hsl(212,40%,15%)] flex items-center justify-center mx-auto mb-4">
              <MapPinIcon className="w-6 h-6 text-[var(--ds-blue-700)]" />
            </div>
            <h3 className="font-semibold text-[var(--ds-gray-1000)] mb-2">Live GPS Tracking</h3>
            <p className="text-sm text-[var(--ds-gray-600)]">
              See your shipment&apos;s exact location on an interactive map with real-time updates.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--ds-green-100)] dark:bg-[hsl(145,40%,10%)] flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-6 h-6 text-[var(--ds-green-700)]" />
            </div>
            <h3 className="font-semibold text-[var(--ds-gray-1000)] mb-2">ETA Updates</h3>
            <p className="text-sm text-[var(--ds-gray-600)]">
              Get estimated delivery times updated automatically as your shipment progresses.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--ds-purple-100)] dark:bg-[hsl(270,40%,12%)] flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-[var(--ds-purple-700)]" />
            </div>
            <h3 className="font-semibold text-[var(--ds-gray-1000)] mb-2">Proof of Delivery</h3>
            <p className="text-sm text-[var(--ds-gray-600)]">
              Access delivery confirmation with signatures, photos, and timestamps.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
