'use client';

import React, { useState } from 'react';
import {
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

interface PreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'PLN', 'RON'];

const THEMES = [
  { id: 'light', label: 'Light', Icon: SunIcon },
  { id: 'dark', label: 'Dark', Icon: MoonIcon },
  { id: 'system', label: 'System', Icon: ComputerDesktopIcon },
];

export function PreferencesStep({ onNext, onBack, onSkip }: PreferencesStepProps) {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('EUR');
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    inApp: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="px-4 py-6 sm:py-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: 'var(--ds-purple-200, #e9d5ff)' }}
        >
          <Cog6ToothIcon className="h-5 w-5" style={{ color: 'var(--ds-purple-900, #581c87)' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--ds-gray-1000)' }}>
            Set Up Your Preferences
          </h2>
          <p className="text-sm" style={{ color: 'var(--ds-gray-600, #9ca3af)' }}>
            Customize your workspace
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Language */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--ds-gray-900, #374151)' }}
          >
            Language
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150"
                style={{
                  background:
                    language === lang.code
                      ? 'var(--ds-blue-100, #eff6ff)'
                      : 'var(--ds-background-100, #fff)',
                  borderColor:
                    language === lang.code
                      ? 'var(--ds-blue-500, #3b82f6)'
                      : 'var(--ds-border, #e5e7eb)',
                  color:
                    language === lang.code
                      ? 'var(--ds-blue-900, #1e3a5f)'
                      : 'var(--ds-gray-700, #6b7280)',
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--ds-gray-900, #374151)' }}
          >
            Default Currency
          </label>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() => setCurrency(cur)}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150"
                style={{
                  background:
                    currency === cur
                      ? 'var(--ds-blue-100, #eff6ff)'
                      : 'var(--ds-background-100, #fff)',
                  borderColor:
                    currency === cur
                      ? 'var(--ds-blue-500, #3b82f6)'
                      : 'var(--ds-border, #e5e7eb)',
                  color:
                    currency === cur
                      ? 'var(--ds-blue-900, #1e3a5f)'
                      : 'var(--ds-gray-700, #6b7280)',
                }}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--ds-gray-900, #374151)' }}
          >
            Notification Preferences
          </label>
          <div className="space-y-2">
            {([
              { key: 'email' as const, label: 'Email notifications' },
              { key: 'push' as const, label: 'Push notifications' },
              { key: 'inApp' as const, label: 'In-app notifications' },
            ]).map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-all"
                style={{
                  borderColor: notifications[key]
                    ? 'var(--ds-blue-500, #3b82f6)'
                    : 'var(--ds-border, #e5e7eb)',
                  background: notifications[key]
                    ? 'var(--ds-blue-50, #f0f9ff)'
                    : 'var(--ds-background-100, #fff)',
                }}
              >
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() => toggleNotification(key)}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--ds-gray-900, #374151)' }}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--ds-gray-900, #374151)' }}
          >
            Theme
          </label>
          <div className="flex gap-2">
            {THEMES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150"
                style={{
                  background:
                    theme === id
                      ? 'var(--ds-blue-100, #eff6ff)'
                      : 'var(--ds-background-100, #fff)',
                  borderColor:
                    theme === id
                      ? 'var(--ds-blue-500, #3b82f6)'
                      : 'var(--ds-border, #e5e7eb)',
                  color:
                    theme === id
                      ? 'var(--ds-blue-900, #1e3a5f)'
                      : 'var(--ds-gray-700, #6b7280)',
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
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
