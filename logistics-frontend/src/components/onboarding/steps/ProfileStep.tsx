'use client';

import React, { useState } from 'react';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

interface ProfileStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const EU_COUNTRIES = [
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
];

const FLEET_SIZES = ['1-5', '6-20', '21-50', '51-100', '100+'];

export function ProfileStep({ onNext, onBack, onSkip }: ProfileStepProps) {
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [fleetSize, setFleetSize] = useState('');

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="px-4 py-6 sm:py-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: 'var(--ds-blue-200, #dbeafe)' }}
        >
          <BuildingOffice2Icon className="h-5 w-5" style={{ color: 'var(--ds-blue-900, #1e3a5f)' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
            Complete Your Profile
          </h2>
          <p className="text-sm" style={{ color: 'var(--ds-gray-600, #9ca3af)' }}>
            Help us personalize your experience
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Company Name */}
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--ds-gray-900, #374151)' }}
          >
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Logistics GmbH"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2"
            style={{
              background: 'var(--ds-background-100, #fff)',
              borderColor: 'var(--ds-border, #e5e7eb)',
              color: 'var(--ds-gray-1000)',
            }}
          />
        </div>

        {/* VAT Number */}
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--ds-gray-900, #374151)' }}
          >
            VAT Number
          </label>
          <input
            type="text"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
            placeholder="DE123456789"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2"
            style={{
              background: 'var(--ds-background-100, #fff)',
              borderColor: 'var(--ds-border, #e5e7eb)',
              color: 'var(--ds-gray-1000)',
            }}
          />
        </div>

        {/* Operating Countries */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--ds-gray-900, #374151)' }}
          >
            Operating Countries
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {EU_COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => toggleCountry(country.code)}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all duration-150"
                style={{
                  background: selectedCountries.includes(country.code)
                    ? 'var(--ds-blue-100, #eff6ff)'
                    : 'var(--ds-background-100, #fff)',
                  borderColor: selectedCountries.includes(country.code)
                    ? 'var(--ds-blue-500, #3b82f6)'
                    : 'var(--ds-border, #e5e7eb)',
                  color: selectedCountries.includes(country.code)
                    ? 'var(--ds-blue-900, #1e3a5f)'
                    : 'var(--ds-gray-700, #6b7280)',
                }}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Size */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--ds-gray-900, #374151)' }}
          >
            Fleet Size
          </label>
          <div className="flex flex-wrap gap-2">
            {FLEET_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFleetSize(size)}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150"
                style={{
                  background:
                    fleetSize === size
                      ? 'var(--ds-blue-100, #eff6ff)'
                      : 'var(--ds-background-100, #fff)',
                  borderColor:
                    fleetSize === size
                      ? 'var(--ds-blue-500, #3b82f6)'
                      : 'var(--ds-border, #e5e7eb)',
                  color:
                    fleetSize === size
                      ? 'var(--ds-blue-900, #1e3a5f)'
                      : 'var(--ds-gray-700, #6b7280)',
                }}
              >
                {size} vehicles
              </button>
            ))}
          </div>
        </div>
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
