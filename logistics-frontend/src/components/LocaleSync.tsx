'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * Syncs the Zustand locale state with the <html lang="..."> attribute.
 * Also initializes locale from user profile on login.
 */
export function LocaleSync() {
  const locale = useAppStore((state) => state.locale);
  const setLocale = useAppStore((state) => state.setLocale);
  const user = useAuthStore((state) => state.user);

  // Initialize locale from user's saved language preference
  useEffect(() => {
    if (user?.language && user.language !== locale) {
      setLocale(user.language);
    }
  }, [user?.language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync to <html> element
  useEffect(() => {
    if (locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}
