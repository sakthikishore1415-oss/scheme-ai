import { TranslationDictionary, TranslationKey } from './types';
import { en } from './en';
import { ta } from './ta';
import { ml } from './ml';
import { hi } from './hi';
import { te } from './te';
import { kn } from './kn';
import { bn } from './bn';
import { mr } from './mr';
import { gu } from './gu';
import { or } from './or';
import { pa } from './pa';
import { as } from './as';

export const TRANSLATIONS: Record<string, TranslationDictionary> = {
  en,
  ta,
  ml,
  hi,
  te,
  kn,
  bn,
  mr,
  gu,
  or,
  pa,
  as,
};

export function getTranslation(langId: string, key: TranslationKey): string {
  const normalizedLang = (langId || 'en').toLowerCase().split('-')[0].split('_')[0];
  const dict = TRANSLATIONS[normalizedLang] || TRANSLATIONS['en'];
  return dict[key] || TRANSLATIONS['en'][key] || (key as string);
}

export * from './types';
