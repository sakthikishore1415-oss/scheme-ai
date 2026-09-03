import { TranslationDictionary, TranslationKey } from './types';
import { en } from './en';
import { ta } from './ta';
import { ml } from './ml';

export const TRANSLATIONS: Record<string, TranslationDictionary> = {
  en,
  ta,
  ml,
};

export function getTranslation(langId: string, key: TranslationKey): string {
  const dict = TRANSLATIONS[langId] || TRANSLATIONS['en'];
  return dict[key] || TRANSLATIONS['en'][key] || (key as string);
}

export * from './types';
