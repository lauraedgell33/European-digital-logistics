import en from '@/locales/en.json';
import de from '@/locales/de.json';
import fr from '@/locales/fr.json';
import ro from '@/locales/ro.json';
import es from '@/locales/es.json';
import it from '@/locales/it.json';
import pl from '@/locales/pl.json';

const dictionaries: Record<string, Record<string, any>> = { en, de, fr, ro, es, it, pl };

function getNestedValue(obj: Record<string, any>, key: string): string {
  const keys = key.split('.');
  let result: any = obj;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key;
    }
  }
  return typeof result === 'string' ? result : key;
}

export function t(key: string, locale: string = 'en', params?: Record<string, string | number>): string {
  let value = getNestedValue(dictionaries[locale] || dictionaries.en, key);
  if (value === key && locale !== 'en') {
    value = getNestedValue(dictionaries.en, key);
  }
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, String(v));
    });
  }
  return value;
}

export const supportedLocales = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];
