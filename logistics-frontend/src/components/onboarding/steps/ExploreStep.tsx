'use client';

import React from 'react';

interface ExploreStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const FEATURES = [
  {
    emoji: '🚛',
    title: 'Freight Exchange',
    description:
      'Post transport loads and find available freight across Europe. Match with verified carriers instantly.',
    color: 'var(--ds-blue-100, #eff6ff)',
    borderColor: 'var(--ds-blue-300, #93c5fd)',
  },
  {
    emoji: '🚐',
    title: 'Vehicle Exchange',
    description:
      'Find available trucks, vans, and specialized vehicles. Filter by type, capacity, and location.',
    color: 'var(--ds-green-100, #ecfdf5)',
    borderColor: 'var(--ds-green-300, #6ee7b7)',
  },
  {
    emoji: '📋',
    title: 'Transport Orders',
    description:
      'Manage orders end-to-end with digital CMR, proof of delivery, and automated invoicing.',
    color: 'var(--ds-amber-100, #fffbeb)',
    borderColor: 'var(--ds-amber-300, #fcd34d)',
  },
  {
    emoji: '📍',
    title: 'Live Tracking',
    description:
      'Real-time GPS monitoring of all shipments. Get instant alerts on delays and ETAs.',
    color: 'var(--ds-purple-100, #f5f3ff)',
    borderColor: 'var(--ds-purple-300, #c4b5fd)',
  },
];

export function ExploreStep({ onNext, onBack, onSkip }: ExploreStepProps) {
  return (
    <div className="px-4 py-6 sm:py-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--ds-gray-1000)' }}>
          Explore the Marketplace
        </h2>
        <p className="text-sm" style={{ color: 'var(--ds-gray-600, #9ca3af)' }}>
          Discover the powerful tools at your fingertips
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FEATURES.map((feature, idx) => (
          <div
            key={feature.title}
            className="group relative rounded-xl border p-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg cursor-default"
            style={{
              background: feature.color,
              borderColor: feature.borderColor,
              animationDelay: `${idx * 100}ms`,
            }}
          >
            <div className="text-3xl mb-2">{feature.emoji}</div>
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: 'var(--ds-gray-1000)' }}
            >
              {feature.title}
            </h3>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--ds-gray-700, #6b7280)' }}
            >
              {feature.description}
            </p>

            {/* Hover highlight line */}
            <div
              className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: feature.borderColor }}
            />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--ds-gray-700, #6b7280)' }}
        >
          ← Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            style={{
              borderColor: 'var(--ds-border, #e5e7eb)',
              color: 'var(--ds-gray-600, #9ca3af)',
            }}
          >
            Skip
          </button>
          <button
            onClick={onNext}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'var(--ds-blue-900, #1d4ed8)' }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
