import en from '@/locales/en.json';
import de from '@/locales/de.json';
import fr from '@/locales/fr.json';
import pl from '@/locales/pl.json';
import ro from '@/locales/ro.json';
import es from '@/locales/es.json';
import it from '@/locales/it.json';

export type Locale = 'en' | 'de' | 'fr' | 'pl' | 'ro' | 'es' | 'it';

export const SUPPORTED_LOCALES: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'pl', label: 'Polski' },
  { value: 'ro', label: 'Română' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
];

const messages: Record<Locale, typeof en> = {
  en,
  de,
  fr,
  pl,
  ro,
  es,
  it,
};

export type TranslationKeys = typeof en;

/**
 * Get a nested value from an object using dot notation
 * e.g., getNestedValue(obj, 'nav.dashboard') => obj.nav.dashboard
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return the key path as fallback
    }
  }
  return typeof current === 'string' ? current : path;
}

/**
 * Get translations for a specific locale.
 * Returns a `t` function that accepts dot-notation keys.
 *
 * Usage:
 *   const { t } = useTranslation();
 *   t('nav.dashboard')    // "Dashboard"
 *   t('common.save')      // "Save"
 *   t('validation.minLength', { min: '8' })  // "Must be at least 8 characters"
 */
export function getTranslations(locale: Locale = 'en') {
  const dict = messages[locale] || messages.en;

  function t(key: string, params?: Record<string, string>): string {
    let value = getNestedValue(dict as unknown as Record<string, unknown>, key);

    // Fallback to English if key not found in current locale
    if (value === key && locale !== 'en') {
      value = getNestedValue(messages.en as unknown as Record<string, unknown>, key);
    }

    // Replace template parameters like {min}, {max}
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
      });
    }

    return value;
  }

  return { t, locale, messages: dict };
}

export default messages;
