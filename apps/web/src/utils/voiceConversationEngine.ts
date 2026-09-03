import { RegionalVoicePack, getVoicePack } from '../data/locales';
import { ExtractedProfileData, extractProfileFromSpokenText, translateToEnglish } from './nlpExtractor';
import { UserProfile, Scheme } from '../types';

export type ConversationPhase =
  | 'GREETING'
  | 'PERMISSION'
  | 'COLLECTING_BASICS'
  | 'ADAPTIVE_FOLLOWUP'
  | 'CONFIRMATION'
  | 'MATCH_ANNOUNCEMENT'
  | 'DEEP_DIVE'
  | 'NEXT_ACTIONS';

export interface ConversationTurn {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  englishTranslation?: string;
  timestamp: number;
  highlightedSentence?: string;
  actionButtons?: { label: string; action: string }[];
}

export type VoiceIntent =
  | 'TELL_MORE'
  | 'DOCUMENTS_REQUIRED'
  | 'SAVE_SCHEME'
  | 'REPEAT'
  | 'SPEAK_SLOWER'
  | 'CHANGE_LANGUAGE'
  | 'TALK_TO_HELPER'
  | 'CONFIRM_YES'
  | 'CONFIRM_NO'
  | 'GENERAL_INFO';

export function parseVoiceIntent(spokenText: string): VoiceIntent {
  const lower = spokenText.toLowerCase();

  if (
    lower.includes('tell me more') ||
    lower.includes('மேலும்') ||
    lower.includes('விளக்குங்கள்') ||
    lower.includes('विस्तार') ||
    lower.includes('more info') ||
    lower.includes('கூறுங்கள்')
  ) {
    return 'TELL_MORE';
  }

  if (
    lower.includes('document') ||
    lower.includes('ஆவணம்') ||
    lower.includes('சான்றிதழ்') ||
    lower.includes('दस्तावेज') ||
    lower.includes('certificate') ||
    lower.includes('காப்பீடு')
  ) {
    return 'DOCUMENTS_REQUIRED';
  }

  if (
    lower.includes('save') ||
    lower.includes('சேமி') ||
    lower.includes('பதிவு செய்') ||
    lower.includes('सहेजें')
  ) {
    return 'SAVE_SCHEME';
  }

  if (
    lower.includes('repeat') ||
    lower.includes('மீண்டும்') ||
    lower.includes('மறுபடியும்') ||
    lower.includes('दोहराएं') ||
    lower.includes('once more')
  ) {
    return 'REPEAT';
  }

  if (
    lower.includes('slower') ||
    lower.includes('slow') ||
    lower.includes('மெதுவாக') ||
    lower.includes('பொறுமையாக') ||
    lower.includes('धीमे')
  ) {
    return 'SPEAK_SLOWER';
  }

  if (
    lower.includes('change language') ||
    lower.includes('மொழி மாற்று') ||
    lower.includes('भाषा') ||
    lower.includes('tamil') ||
    lower.includes('english') ||
    lower.includes('hindi')
  ) {
    return 'CHANGE_LANGUAGE';
  }

  if (
    lower.includes('helper') ||
    lower.includes('human') ||
    lower.includes('e-seva') ||
    lower.includes('உதவியாளர்') ||
    lower.includes('அதிகாரி') ||
    lower.includes('मददगार')
  ) {
    return 'TALK_TO_HELPER';
  }

  if (
    lower.includes('yes') ||
    lower.includes('ஆம்') ||
    lower.includes('சரி') ||
    lower.includes('हाँ') ||
    lower.includes('okay') ||
    lower.includes('sure') ||
    lower.includes('கண்டிப்பாக')
  ) {
    return 'CONFIRM_YES';
  }

  if (
    lower.includes('no') ||
    lower.includes('இல்லை') ||
    lower.includes('வேண்டாம்') ||
    lower.includes('नहीं')
  ) {
    return 'CONFIRM_NO';
  }

  return 'GENERAL_INFO';
}

export function generateFollowUpQuestion(
  profession: string,
  langId: string = 'ta'
): string {
  const pack = getVoicePack(langId);
  return pack.professionFollowUp(profession);
}

export function generateSchemeExplanation(
  scheme: Scheme,
  langId: string = 'ta'
): string {
  if (langId === 'ta') {
    return `${scheme.nativeName || scheme.name}: இந்த திட்டம் ${scheme.category} பிரிவின் கீழ் வருகிறது. ${scheme.summarySimple}`;
  }
  return `${scheme.name}: This scheme provides targeted support under ${scheme.category}. ${scheme.summarySimple}`;
}

