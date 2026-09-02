import { NeedCategory } from '../types';

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
  // Tamil: 48 வயசு, 48 வயது / English: 48 years / Hindi: 48 साल, 48 वर्ष / Malayalam: 20 വയസ്സ്
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
    extracted.occupation = 'Unemployed Youth';
    extracted.need = 'employment';
  } else if (
    textLower.includes('முதியோர்') ||
    textLower.includes('senior') ||
    textLower.includes('retired') ||
    textLower.includes('old age') ||
    textLower.includes('வார்ദ്ധக்ய') ||
    textLower.includes('ವೃದ್ಧಾಪ್ಯ') ||
    textLower.includes('వృద్ధాప్య') ||
    textLower.includes('बुजुर्ग')
  ) {
    extracted.occupation = 'Senior Citizen';
    extracted.need = 'senior_citizens';
  }

  // 3. Need Extraction fallback
  if (!extracted.need) {
    if (
      textLower.includes('வீடு') ||
      textLower.includes('house') ||
      textLower.includes('housing') ||
      textLower.includes('வீடு கட்ட') ||
      textLower.includes('വീട്') ||
      textLower.includes('ಮನೆ') ||
      textLower.includes('ఇల్లు') ||
      textLower.includes('मकान') ||
      textLower.includes('आवास') ||
      textLower.includes('ঘর')
    ) {
      extracted.need = 'housing';
    } else if (
      textLower.includes('மருத்துவ') ||
      textLower.includes('health') ||
      textLower.includes('hospital') ||
      textLower.includes('காப்பீடு') ||
      textLower.includes('ചികിത്സ') ||
      textLower.includes('ಆರೋಗ್ಯ') ||
      textLower.includes('ఆరోగ్య') ||
      textLower.includes('इलाज') ||
      textLower.includes('হাসপাতাল')
    ) {
      extracted.need = 'health';
    } else if (
      textLower.includes('மகள்') ||
      textLower.includes('பெண்') ||
      textLower.includes('மகளிர்') ||
      textLower.includes('women') ||
      textLower.includes('mother') ||
      textLower.includes('ശ്രീ') ||
      textLower.includes('ಮಹಿಳೆ') ||
      textLower.includes('మహిళ') ||
      textLower.includes('महिला') ||
      textLower.includes('নারী')
    ) {
      extracted.need = 'women';
    } else if (
      textLower.includes('loan') ||
      textLower.includes('கடன்') ||
      textLower.includes('பணம்') ||
      textLower.includes('நிதி')
    ) {
      extracted.need = 'financial';
    }
  }

  // 4. Robust Income Extraction (Numbers, Lakhs, Regional words)
  const lakhMatch = textLower.match(/(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|லட்சம்|லக்ஷம்|लाख|ലക്ഷം|లక్ష)/i);
  if (lakhMatch) {
    const num = parseFloat(lakhMatch[1]);
    if (!isNaN(num) && num > 0) {
      extracted.annualIncome = Math.round(num * 100000);
    }
  } else if (textLower.includes('ஒன்றரை லட்சம்') || textLower.includes('1.5 lakh')) {
    extracted.annualIncome = 150000;
  } else if (textLower.includes('ஒரு லட்சம்') || textLower.includes('1 lakh')) {
    extracted.annualIncome = 100000;
  } else if (textLower.includes('இரண்டு லட்சம்') || textLower.includes('2 lakh')) {
    extracted.annualIncome = 200000;
  } else if (textLower.includes('மூன்று லட்சம்') || textLower.includes('3 lakh')) {
    extracted.annualIncome = 300000;
  } else if (textLower.includes('எண்பதாயிரம்') || textLower.includes('80 ஆயிரம்')) {
    extracted.annualIncome = 80000;
  } else if (textLower.includes('அறுபதாயிரம்') || textLower.includes('60 ஆயிரம்')) {
    extracted.annualIncome = 60000;
  } else if (textLower.includes('ஐம்பதாயிரம்') || textLower.includes('50 ஆயிரம்')) {
    extracted.annualIncome = 50000;
  } else {
    // Explicit currency / income keyword pattern (prevents matching arbitrary 4-digit years like 2026)
    const incomePattern = textLower.match(/(?:income|salary|வருமானம்|வருஷம்|ரூபாய்|rs\.?|₹)\s*[:=]?\s*(\d{4,7})/i) ||
      textLower.match(/(\d{4,7})\s*(?:income|salary|வருமானம்|வருஷம்|ரூபாய்|rupees|inr)/i);
    if (incomePattern) {
      extracted.annualIncome = parseInt(incomePattern[1], 10);
    }
  }

  // 5. Beneficiary relationship
  if (
    textLower.includes('மகள்') ||
    textLower.includes('daughter') ||
    textLower.includes('മകൾ') ||
    textLower.includes('ಮಗಳು') ||
    textLower.includes('కుమార్తె') ||
    textLower.includes('बेटी')
  ) {
    extracted.beneficiary = 'Daughter';
    extracted.gender = 'female';
  } else if (
    textLower.includes('மகன்') ||
    textLower.includes('son') ||
    textLower.includes('മകൻ') ||
    textLower.includes('ಮಗ') ||
    textLower.includes('కుమారుడు') ||
    textLower.includes('बेटा')
  ) {
    extracted.beneficiary = 'Son';
    extracted.gender = 'male';
  } else if (
    textLower.includes('தாய்') ||
    textLower.includes('அம்மா') ||
    textLower.includes('mother') ||
    textLower.includes('അമ്മ') ||
    textLower.includes('ತಾಯಿ') ||
    textLower.includes('తల్లి') ||
    textLower.includes('माँ')
  ) {
    extracted.beneficiary = 'Mother';
    extracted.gender = 'female';
  }

  extracted.rawTranscribedEnglish = spokenText;

  return extracted;
}
