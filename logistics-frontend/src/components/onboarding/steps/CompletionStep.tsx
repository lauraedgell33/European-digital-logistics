'use client';

import React from 'react';
import { CheckCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

interface CompletionStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const QUICK_LINKS = [
  { label: 'Post first freight', href: '/freight/create', emoji: '🚛' },
  { label: 'Browse vehicles', href: '/vehicles', emoji: '🚐' },
  { label: 'Go to Dashboard', href: '/dashboard', emoji: '📊' },
];

export function CompletionStep({ onNext, onBack }: CompletionStepProps) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-6 sm:py-10 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      {/* CSS-only confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60 - 20}%`,
              width: `${6 + Math.random() * 6}px`,
              height: `${6 + Math.random() * 6}px`,
              background: [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
              ][i % 6],
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              opacity: 0.7 + Math.random() * 0.3,
              animationDuration: `${1.5 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Success icon */}
      <div className="relative z-10 mb-6">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: 'var(--ds-green-100, #ecfdf5)' }}
        >
          <CheckCircleIcon
            className="h-12 w-12"
            style={{ color: 'var(--ds-green-600, #059669)' }}
          />
        </div>
      </div>

      {/* Title */}
      <h2
        className="relative z-10 text-2xl sm:text-3xl font-bold mb-2"
        style={{ color: 'var(--ds-gray-1000)' }}
      >
        You&apos;re All Set! 🎉
      </h2>
      <p
        className="relative z-10 text-base mb-8"
        style={{ color: 'var(--ds-gray-600, #9ca3af)' }}
      >
        Your workspace is ready. Start exploring LogiMarket!
      </p>

      {/* Quick start links */}
      <div className="relative z-10 w-full max-w-sm space-y-2 mb-8">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--ds-gray-500, #9ca3af)' }}
        >
          Quick Start
        </p>
        {QUICK_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => {
              e.preventDefault();
              onNext();
            }}
            className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
            style={{
              background: 'var(--ds-background-100, #fff)',
              borderColor: 'var(--ds-border, #e5e7eb)',
              color: 'var(--ds-gray-900, #374151)',
            }}
          >
            <span className="text-xl">{link.emoji}</span>
            <span className="flex-1 text-left">{link.label}</span>
            <svg
              className="h-4 w-4 opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        ))}
      </div>

      {/* Buttons */}
      <div className="relative z-10 flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={onNext}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          style={{ background: 'var(--ds-blue-900, #1d4ed8)' }}
        >
          <RocketLaunchIcon className="h-5 w-5" />
          Start Using LogiMarket
        </button>
        <button
          onClick={onBack}
          className="text-sm font-medium transition-colors"
          style={{ color: 'var(--ds-gray-500, #9ca3af)' }}
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}
