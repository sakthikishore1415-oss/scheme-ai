import { SUPPORTED_LANGUAGES } from '../data/languages';
import { LanguageConfig } from '../types';

/**
 * Unicode Script Ranges for Indian Regional Languages
 */
const SCRIPT_RANGES: { langId: string; regex: RegExp; name: string }[] = [
  { langId: 'ta', regex: /[\u0B80-\u0BFF]/, name: 'Tamil' },
  { langId: 'te', regex: /[\u0C00-\u0C7F]/, name: 'Telugu' },
  { langId: 'kn', regex: /[\u0C80-\u0CFF]/, name: 'Kannada' },
  { langId: 'ml', regex: /[\u0D00-\u0D7F]/, name: 'Malayalam' },
  { langId: 'hi', regex: /[\u0900-\u097F]/, name: 'Hindi' }, // Devanagari (also Marathi fallback)
  { langId: 'bn', regex: /[\u0980-\u09FF]/, name: 'Bengali' },
  { langId: 'gu', regex: /[\u0A80-\u0AFF]/, name: 'Gujarati' },
  { langId: 'or', regex: /[\u0B00-\u0B7F]/, name: 'Odia' },
  { langId: 'pa', regex: /[\u0A00-\u0A7F]/, name: 'Punjabi' },
  { langId: 'as', regex: /[\u0980-\u09FF]/, name: 'Assamese' },
];

export function containsIndicScript(text: string): boolean {
  return /[\u0900-\u0D7F]/.test(text);
}

/**
 * Automatically detects the language from a given text string based on Unicode character distribution.
 */
export function detectLanguageFromText(text: string): string | null {
  if (!text || text.trim().length === 0) return null;

  for (const item of SCRIPT_RANGES) {
    if (item.regex.test(text)) {
      return item.langId;
    }
  }

  // If Latin / English characters are predominant
  if (/[a-zA-Z]/.test(text)) {
    return 'en';
  }

  return null;
}

/**
 * Automatically detects the user's preferred language from browser settings.
 */
export function detectBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'ta';

  const browserLangs = navigator.languages || [navigator.language];

  for (const fullCode of browserLangs) {
    if (!fullCode) continue;
    const primary = fullCode.toLowerCase().split('-')[0];

    if (SUPPORTED_LANGUAGES[primary]) {
      return primary;
    }
  }

  return 'ta'; // Default to Tamil as primary regional locale for PACS Sahayak
}

/**
 * Safe lookup for language configuration
 */
export function getLanguageConfig(langId: string): LanguageConfig {
  const normalized = (langId || 'en').toLowerCase().split('-')[0].split('_')[0];
  return SUPPORTED_LANGUAGES[normalized] || SUPPORTED_LANGUAGES[langId] || SUPPORTED_LANGUAGES['en'] || {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    bcp47Code: 'en-IN',
    voiceSupport: true,
    ttsSupport: true,
    samplePhrase: '',
    sampleTranscription: ''
  };
}

