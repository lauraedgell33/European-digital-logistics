import en from '@/locales/en.json';
import de from '@/locales/de.json';
import fr from '@/locales/fr.json';
import ro from '@/locales/ro.json';
import es from '@/locales/es.json';
import it from '@/locales/it.json';
import pl from '@/locales/pl.json';
import nl from '@/locales/nl.json';
import pt from '@/locales/pt.json';
import sv from '@/locales/sv.json';
import cs from '@/locales/cs.json';
import da from '@/locales/da.json';
import fi from '@/locales/fi.json';
import hu from '@/locales/hu.json';
import hr from '@/locales/hr.json';
import bg from '@/locales/bg.json';
import el from '@/locales/el.json';
import et from '@/locales/et.json';
import lv from '@/locales/lv.json';
import lt from '@/locales/lt.json';
import mt from '@/locales/mt.json';
import sk from '@/locales/sk.json';
import sl from '@/locales/sl.json';
import no from '@/locales/no.json';
import is from '@/locales/is.json';
import ga from '@/locales/ga.json';
import uk from '@/locales/uk.json';
import tr from '@/locales/tr.json';
import sr from '@/locales/sr.json';
import sq from '@/locales/sq.json';

type DictionaryValue = string | Record<string, unknown>;

const dictionaries: Record<string, Record<string, DictionaryValue>> = {
  en, de, fr, ro, es, it, pl,
  nl, pt, sv, cs, da, fi, hu,
  hr, bg, el, et, lv, lt, mt,
  sk, sl, no, is, ga, uk, tr,
  sr, sq,
};

function getNestedValue(obj: Record<string, unknown>, key: string): string {
  const keys = key.split('.');
  let result: unknown = obj;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in (result as Record<string, unknown>)) {
      result = (result as Record<string, unknown>)[k];
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
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'mt', name: 'Malti', flag: '🇲🇹' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'sr', name: 'Srpski', flag: '🇷🇸' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
];
