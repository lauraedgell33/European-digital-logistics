'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/stores/appStore';
import { getTranslations, type Locale } from '@/lib/i18n';

/**
 * React hook for accessing translations.
 * Reads the current locale from the app store (Zustand).
 *
 * Usage:
 *   const { t } = useTranslation();
 *   <span>{t('nav.dashboard')}</span>
 */
export function useTranslation() {
  const locale = useAppStore((state) => state.locale) as Locale;

  const { t, messages } = useMemo(
    () => getTranslations(locale || 'en'),
    [locale]
  );

  return { t, locale: (locale || 'en') as Locale, messages };
}
