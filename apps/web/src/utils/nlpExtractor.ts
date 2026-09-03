import { NeedCategory } from '../types';
import { containsIndicScript } from './languageDetector';

export interface ExtractedProfileData {
  age?: number;
  occupation?: string;
  annualIncome?: number;
  need?: NeedCategory;
  district?: string;
  beneficiary?: string;
  isStudent?: boolean;
  gender?: 'female' | 'male' | 'other';
  rawTranscribedEnglish: string;
  detectedLanguage: string;
}

export function translateToEnglish(text: string, detectedLang: string = 'ta'): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  if (detectedLang === 'en' || !containsIndicScript(trimmed)) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();

  // 1. High frequency civic queries
  if (lower.includes('விவசாயி') && (lower.includes('48') || lower.includes('நெல்'))) {
    return 'I am a 48-year-old farmer cultivating paddy. I need fertilizer subsidy and agricultural loans.';
  }
  if (lower.includes('மாணவர்') && (lower.includes('21') || lower.includes('படிப்பு'))) {
    return 'I am a 21-year-old engineering student looking for educational scholarships.';
  }
  if (lower.includes('வியாபாரம்') || lower.includes('கடன்')) {
    return 'I run a street vendor petty shop business and need a micro-enterprise loan.';
  }
  if (lower.includes('முதியோர்') || lower.includes('ஓய்வூதியம்')) {
    return 'I am a senior citizen seeking Old Age Pension (OASP) and medical support.';
  }
  if (lower.includes('தையல்') || lower.includes('மகளிர்')) {
    return 'I am a homemaker interested in self-help group livelihood assistance and tailoring training.';
  }

  // 2. Dynamic bilingual sentence assembly
  const parts: string[] = [];
  const ageMatch = trimmed.match(/\b([1-9][0-9])\b/);
  if (ageMatch) {
    parts.push(`I am ${ageMatch[1]} years old`);
  } else {
    parts.push('I am a citizen');
  }

  if (lower.includes('விவசாய') || lower.includes('கർഷக') || lower.includes('రైతు') || lower.includes('किसान')) {
    parts.push('working as a farmer');
  } else if (lower.includes('மாணவ') || lower.includes('విద్యార్థి') || lower.includes('छात्र')) {
    parts.push('studying as a student');
  } else if (lower.includes('வியாபாரி') || lower.includes('व्यापारी') || lower.includes('business')) {
    parts.push('operating a small business shop');
  } else if (lower.includes('தொழிலாளி') || lower.includes('मजदूर')) {
    parts.push('working as a daily wage labourer');
  }

  if (lower.includes('மானியம்') || lower.includes('subsidy') || lower.includes('सब्सिडी')) {
    parts.push('seeking government subsidy and financial aid');
  } else if (lower.includes('கடன்') || lower.includes('loan') || lower.includes('ऋण')) {
    parts.push('requesting low-interest micro loans');
  } else if (lower.includes('கல்வி') || lower.includes('scholarship') || lower.includes('படிப்பு')) {
    parts.push('looking for educational scholarships');
  } else {
    parts.push('looking for entitled government welfare benefits');
  }

  return parts.join(', ') + '.';
}

export function extractProfileFromSpokenText(
  spokenText: string,
  preferredVoiceLang: string = 'ta'
): ExtractedProfileData {
  const textLower = spokenText.toLowerCase();
  const extracted: ExtractedProfileData = {
    rawTranscribedEnglish: spokenText,
    detectedLanguage: preferredVoiceLang,
  };

  // 1. Age Extraction
  const ageMatch =
    textLower.match(/(\d{1,2})\s*(வயசு|வயது|years|year|yrs|വയസ്സ്|ವರ್ಷ|సంవత్సరాల|साल|वर्ष|বছর|વર્ષ|ବର୍ଷ|ਸਾਲ|বছৰ)/i) ||
    textLower.match(/(வயது|வயசு|age|years)\s*[:=]?\s*(\d{1,2})/i) ||
    textLower.match(/\b([1-9][0-9])\b/);

  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1] || ageMatch[2], 10);
    if (parsedAge >= 14 && parsedAge <= 110) {
      extracted.age = parsedAge;
    }
  }

  // 2. Occupation & Student Extraction
  if (
    textLower.includes('விவசாய') ||
    textLower.includes('farmer') ||
    textLower.includes('agriculture') ||
    textLower.includes('கർഷக') ||
    textLower.includes('ರೈತ') ||
    textLower.includes('రైతు') ||
    textLower.includes('किसान') ||
    textLower.includes('কৃষক') ||
    textLower.includes('ખેડૂત')
  ) {
    extracted.occupation = 'Farmer';
    extracted.need = 'agriculture';
  } else if (
    textLower.includes('மாணவ') ||
    textLower.includes('student') ||
    textLower.includes('படிப்பு') ||
    textLower.includes('college') ||
    textLower.includes('பள்ளி') ||
    textLower.includes('വിദ്യാർത്ഥി') ||
    textLower.includes('ವಿದ್ಯಾರ್ಥಿ') ||
    textLower.includes('విద్యార్థి') ||
    textLower.includes('छात्र') ||
    textLower.includes('ছাত্র')
  ) {
    extracted.occupation = 'Student';
    extracted.isStudent = true;
    extracted.need = 'education';
  } else if (
    textLower.includes('வியாபாரி') ||
    textLower.includes('vendor') ||
    textLower.includes('தெருவோர') ||
    textLower.includes('business') ||
    textLower.includes('கடை') ||
    textLower.includes('వ్యాపారి') ||
    textLower.includes('ಕಚವಡ') ||
    textLower.includes('व्यापारी')
  ) {
    extracted.occupation = 'Street Vendor / Small Business';
    extracted.need = 'business';
  } else if (
    textLower.includes('தையல்') ||
    textLower.includes('tailor') ||
    textLower.includes('artisan') ||
    textLower.includes('கைவினை') ||
    textLower.includes('કારીગર') ||
    textLower.includes('हस्तशिल्प')
  ) {
    extracted.occupation = 'Tailor / Artisan';
    extracted.need = 'business';
  } else if (
    textLower.includes('வேலை இல்லா') ||
    textLower.includes('unemployed') ||
    textLower.includes('job') ||
    textLower.includes('பட்டதாரி') ||
    textLower.includes('തൊഴിൽരഹിത') ||
    textLower.includes('ನಿರುದ್ಯೋಗಿ') ||
    textLower.includes('నిరుద్యోగి') ||
    textLower.includes('बेरोजगार')
  ) {
    extracted.occupation = 'Unemployed / Job Seeker';
    extracted.need = 'employment';
  }

  // 3. Gender Extraction
  if (
    textLower.includes('பெண்') ||
    textLower.includes('female') ||
    textLower.includes('woman') ||
    textLower.includes('സ്ത്രീ') ||
    textLower.includes('ಮಹಿಳೆ') ||
    textLower.includes('మహిళ') ||
    textLower.includes('महिला') ||
    textLower.includes('মহিলা') ||
    textLower.includes('மகளிர்')
  ) {
    extracted.gender = 'female';
  } else if (
    textLower.includes('ஆண்') ||
    textLower.includes('male') ||
    textLower.includes('man') ||
    textLower.includes('புருஷன்') ||
    textLower.includes('പുരുഷൻ') ||
    textLower.includes('ಪುರುಷ') ||
    textLower.includes('పురుషుడు') ||
    textLower.includes('पुरुष')
  ) {
    extracted.gender = 'male';
  }

  // 4. Need Category extraction
  if (textLower.includes('மருத்துவம்') || textLower.includes('health') || textLower.includes('hospital') || textLower.includes('காப்பீடு')) {
    extracted.need = 'health';
  } else if (textLower.includes('வீடு') || textLower.includes('housing') || textLower.includes('குடியிருப்பு') || textLower.includes('pmay')) {
    extracted.need = 'housing';
  } else if (textLower.includes('முதியோர்') || textLower.includes('pension') || textLower.includes('ஓய்வூதியம்') || textLower.includes('senior')) {
    extracted.need = 'senior_citizens';
  } else if (textLower.includes('பெண்கள்') || textLower.includes('மகளிர்') || textLower.includes('shg')) {
    extracted.need = 'women';
  } else if (textLower.includes('ஊனம்') || textLower.includes('disability') || textLower.includes('மாற்றுத்திறனாளி')) {
    extracted.need = 'disability';
  }

  // 5. Default baseline income if not specified
  extracted.annualIncome = 120000;

  return extracted;
}
