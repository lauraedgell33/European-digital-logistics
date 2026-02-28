'use client';

import React from 'react';
import { TruckIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-8 sm:py-12 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Logo / Icon */}
      <div
        className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-2xl"
        style={{ background: 'var(--ds-blue-200, #dbeafe)' }}
      >
        <TruckIcon className="h-12 w-12" style={{ color: 'var(--ds-blue-900, #1e3a5f)' }} />
        <SparklesIcon
          className="absolute -right-2 -top-2 h-7 w-7"
          style={{ color: 'var(--ds-amber-500, #f59e0b)' }}
        />
      </div>

      {/* Title */}
      <h1
        className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
        style={{ color: 'var(--ds-gray-1000)' }}
      >
        Welcome to LogiMarket!
      </h1>

      {/* Subtitle */}
      <p
        className="text-lg sm:text-xl mb-6"
        style={{ color: 'var(--ds-gray-700, #6b7280)' }}
      >
        Europe&apos;s premier digital logistics platform
      </p>

      {/* Description */}
      <div
        className="max-w-md mb-10 text-sm sm:text-base leading-relaxed"
        style={{ color: 'var(--ds-gray-600, #9ca3af)' }}
      >
        <p>
          Manage freight, find vehicles, track shipments in real-time, and
          streamline your entire supply chain — all from one powerful platform.
        </p>
      </div>

      {/* Features preview */}
      <div className="grid grid-cols-2 gap-3 mb-10 w-full max-w-sm text-left">
        {[
          { emoji: '🚛', label: 'Freight Exchange' },
          { emoji: '🚐', label: 'Vehicle Marketplace' },
          { emoji: '📋', label: 'Transport Orders' },
          { emoji: '📍', label: 'Live GPS Tracking' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
            style={{
              background: 'var(--ds-background-100, #f9fafb)',
              color: 'var(--ds-gray-900, #374151)',
              border: '1px solid var(--ds-border, #e5e7eb)',
            }}
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          background: 'var(--ds-blue-900, #1d4ed8)',
        }}
      >
        Let&apos;s get started
        <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  );
}
