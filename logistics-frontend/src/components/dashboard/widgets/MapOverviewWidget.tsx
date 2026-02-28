'use client';

import Link from 'next/link';
import { MapPinIcon, GlobeEuropeAfricaIcon } from '@heroicons/react/24/outline';

export function MapOverviewWidget() {
  return (
    <Link
      href="/tracking"
      className="block no-underline group"
    >
      <div
        className="relative rounded-lg overflow-hidden h-[200px] flex items-center justify-center transition-all duration-200"
        style={{
          background: 'var(--ds-gray-100)',
          border: '1px solid var(--ds-gray-200)',
        }}
      >
        {/* Decorative map background */}
        <svg
          viewBox="0 0 400 200"
          className="absolute inset-0 w-full h-full opacity-[0.08]"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Europe outline simplified */}
          <path
            d="M120 40 L160 30 L200 35 L240 25 L280 40 L300 55 L310 80 L305 100 L290 120 L270 130 L250 135 L230 140 L210 145 L190 140 L170 145 L150 140 L130 130 L120 115 L110 95 L105 70 L110 50 Z"
            fill="var(--ds-gray-1000)"
            stroke="var(--ds-gray-1000)"
            strokeWidth="1"
          />
          {/* Route lines */}
          <line x1="140" y1="80" x2="220" y2="60" stroke="var(--ds-blue-700)" strokeWidth="2" strokeDasharray="6 4" />
          <line x1="220" y1="60" x2="280" y2="90" stroke="var(--ds-blue-700)" strokeWidth="2" strokeDasharray="6 4" />
          <line x1="160" y1="120" x2="240" y2="100" stroke="var(--ds-blue-700)" strokeWidth="2" strokeDasharray="6 4" />
          {/* City dots */}
          <circle cx="140" cy="80" r="4" fill="var(--ds-blue-700)" />
          <circle cx="220" cy="60" r="4" fill="var(--ds-blue-700)" />
          <circle cx="280" cy="90" r="4" fill="var(--ds-blue-700)" />
          <circle cx="160" cy="120" r="4" fill="var(--ds-green-700)" />
          <circle cx="240" cy="100" r="4" fill="var(--ds-green-700)" />
        </svg>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
            style={{
              background: 'var(--ds-blue-200)',
              color: 'var(--ds-blue-900)',
            }}
          >
            <GlobeEuropeAfricaIcon className="h-6 w-6" />
          </div>
          <div>
            <p
              className="text-[14px] font-semibold"
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              Fleet Positions
            </p>
            <p
              className="text-[12px] mt-0.5"
              style={{ color: 'var(--ds-gray-900)' }}
            >
              View real-time tracking map →
            </p>
          </div>
        </div>

        {/* Animated pulsing dots */}
        <div className="absolute top-[30%] left-[25%]">
          <span className="relative flex h-3 w-3">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: 'var(--ds-green-500)' }}
            />
            <span
              className="relative inline-flex rounded-full h-3 w-3"
              style={{ background: 'var(--ds-green-600)' }}
            />
          </span>
        </div>
        <div className="absolute top-[50%] right-[30%]">
          <span className="relative flex h-3 w-3">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: 'var(--ds-blue-500)' }}
            />
            <span
              className="relative inline-flex rounded-full h-3 w-3"
              style={{ background: 'var(--ds-blue-600)' }}
            />
          </span>
        </div>
        <div className="absolute bottom-[25%] left-[45%]">
          <span className="relative flex h-3 w-3">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: 'var(--ds-amber-500)' }}
            />
            <span
              className="relative inline-flex rounded-full h-3 w-3"
              style={{ background: 'var(--ds-amber-600)' }}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
