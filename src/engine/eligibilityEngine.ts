import { Scheme, UserProfile, MatchResult } from '../types';
import { SCHEMES_DATABASE } from '../data/schemes';

export function evaluateSchemeEligibility(scheme: Scheme, profile: UserProfile): MatchResult {
  let matchedPoints: string[] = [];
  let pendingPoints: string[] = [];
  let whyMeEnglish: string[] = [];
  let whyMeRegional: string[] = [];

  let scoreWeight = 0;
  let totalWeight = 0;

  // 1. Location / State Check (Weight: 25)
  totalWeight += 25;
  let locationMatch = false;
  if (scheme.stateId === 'ALL') {
    locationMatch = true;
    scoreWeight += 25;
    matchedPoints.push('Applicable nationwide (Central Scheme) in all states including ' + (profile.state || 'your state'));
    whyMeEnglish.push(`✓ State match: Applicable as a Central Government scheme in ${profile.state || 'your state'}.`);
  } else if (scheme.stateId === profile.state) {
    locationMatch = true;
    scoreWeight += 25;
    matchedPoints.push(`Applicable in your state (${profile.state})`);
    whyMeEnglish.push(`✓ State match: Explicitly applicable in ${profile.state}.`);
  } else {
    locationMatch = false;
    pendingPoints.push(`Scheme is specific to state ${scheme.stateId}, but user state is ${profile.state}`);
  }

  // 2. Need / Category Relevance (Weight: 20)
  totalWeight += 20;
  let categoryMatch = false;
  if (profile.need === 'general' || profile.need === scheme.category) {
    categoryMatch = true;
    scoreWeight += 20;
    matchedPoints.push(`Matches your stated need: ${scheme.category.replace('_', ' ').toUpperCase()}`);
    whyMeEnglish.push(`✓ Need alignment: Matches your primary interest in ${scheme.category.replace('_', ' ')}.`);
  } else if (
    scheme.eligibility.targetCategories &&
    scheme.eligibility.targetCategories.includes(profile.need as any)
  ) {
    categoryMatch = true;
    scoreWeight += 18;
    matchedPoints.push(`Secondary match for your stated need`);
    whyMeEnglish.push(`✓ Need alignment: Relevant secondary benefit category.`);
  } else {
    // slight partial weight for universal schemes (health/financial)
    if (scheme.category === 'health' || scheme.category === 'financial') {
      scoreWeight += 10;
    }
  }

  // 3. Occupation Match (Weight: 20)
  totalWeight += 20;
  let occupationMatch = false;
  if (!scheme.eligibility.allowedOccupations || scheme.eligibility.allowedOccupations.length === 0) {
    occupationMatch = true;
    scoreWeight += 20;
    matchedPoints.push('Open to all occupations');
    whyMeEnglish.push(`✓ Occupation: Open to all occupations (your occupation: ${profile.occupation || 'Any'}).`);
  } else {
    const userOcc = (profile.occupation || '').toLowerCase().trim();
    const isOccMatched = scheme.eligibility.allowedOccupations.some((allowed) => {
      const allowedLower = allowed.toLowerCase();
      return (
        userOcc.includes(allowedLower) ||
        allowedLower.includes(userOcc) ||
        (userOcc.includes('farm') && allowedLower.includes('farm')) ||
        (userOcc.includes('agri') && allowedLower.includes('farm')) ||
        (userOcc.includes('student') && allowedLower.includes('student')) ||
        (userOcc.includes('vendor') && allowedLower.includes('vendor')) ||
        (userOcc.includes('tailor') && allowedLower.includes('tailor')) ||
        (userOcc.includes('artisan') && allowedLower.includes('artisan'))
      );
    });

    if (isOccMatched) {
      occupationMatch = true;
      scoreWeight += 20;
      matchedPoints.push(`Occupation matches listed category: ${profile.occupation}`);
      whyMeEnglish.push(`✓ Occupation: Matches ${profile.occupation} listed criteria.`);
    } else {
      pendingPoints.push(`Listed for: ${scheme.eligibility.allowedOccupations.join(', ')}`);
      whyMeEnglish.push(`⚠ Occupation check: Scheme targets ${scheme.eligibility.allowedOccupations.slice(0, 3).join(', ')}.`);
    }
  }

  // 4. Age Criteria (Weight: 15)
  totalWeight += 15;
  let ageMatch = true;
  const userAge = profile.age || 0;
  if (scheme.eligibility.minAge && userAge < scheme.eligibility.minAge) {
    ageMatch = false;
    pendingPoints.push(`Minimum required age is ${scheme.eligibility.minAge} (User age: ${userAge})`);
  }
  if (scheme.eligibility.maxAge && userAge > scheme.eligibility.maxAge) {
    ageMatch = false;
    pendingPoints.push(`Maximum permissible age is ${scheme.eligibility.maxAge} (User age: ${userAge})`);
  }
  if (ageMatch) {
    scoreWeight += 15;
    matchedPoints.push(`Age ${userAge} falls within eligible age range`);
    whyMeEnglish.push(`✓ Age: Your age (${userAge}) fulfills listed criteria.`);
  }

  // 5. Income Criteria (Weight: 15)
  totalWeight += 15;
  let incomeMatch = true;
  if (scheme.eligibility.maxAnnualIncome) {
    if (profile.annualIncome <= scheme.eligibility.maxAnnualIncome) {
      scoreWeight += 15;
      matchedPoints.push(`Annual income (₹${profile.annualIncome.toLocaleString('en-IN')}) is within ₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')} limit`);
      whyMeEnglish.push(`✓ Income: Reported income of ₹${profile.annualIncome.toLocaleString('en-IN')} is within the limit (₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')}).`);
    } else {
      incomeMatch = false;
      pendingPoints.push(`Annual income limit is ₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')}`);
      whyMeEnglish.push(`⚠ Income limit: Scheme lists limit of ₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')}.`);
    }
  } else {
    scoreWeight += 15;
    matchedPoints.push('No restrictive income ceiling');
    whyMeEnglish.push('✓ Income: No restrictive income cap listed.');
  }

  // 6. Gender Check (Weight: 5)
  totalWeight += 5;
  let genderMatch = true;
  if (scheme.eligibility.targetGenders && scheme.eligibility.targetGenders.length > 0) {
    if (!scheme.eligibility.targetGenders.includes('all')) {
      if (
        profile.gender &&
        profile.gender !== 'unspecified' &&
        !scheme.eligibility.targetGenders.includes(profile.gender as 'female' | 'male' | 'other')
      ) {
        genderMatch = false;
        pendingPoints.push(`Targeted primarily towards: ${scheme.eligibility.targetGenders.join(', ')}`);
      } else {
        scoreWeight += 5;
        matchedPoints.push(`Gender requirement matched`);
        whyMeEnglish.push(`✓ Gender: Requirement matched (${profile.gender}).`);
      }
    } else {
      scoreWeight += 5;
    }
  } else {
    scoreWeight += 5;
  }

  // Calculate final percentage score
  let finalScore = Math.min(100, Math.round((scoreWeight / totalWeight) * 100));

  // Determine Match Level
  let matchLevel: 'STRONG' | 'POTENTIAL' | 'MORE_INFO' = 'POTENTIAL';
  if (finalScore >= 80 && locationMatch) {
    matchLevel = 'STRONG';
  } else if (finalScore >= 50 && locationMatch) {
    matchLevel = 'POTENTIAL';
  } else {
    matchLevel = 'MORE_INFO';
  }

  // Regional language explanation
  const voiceLang = profile.voiceLanguage || 'ta';
  let regionalContent = scheme.languageContent?.[voiceLang];
  let whyMeRegionalString = '';
  let simpleExplanationRegional = '';

  if (regionalContent) {
    whyMeRegional = [
      regionalContent.whyMatchTemplate,
      `தகுதி வரம்புகள்: வயது, வருமானம் மற்றும் தொழில் விதிகளின் ஒப்பீடு.`
    ];
    simpleExplanationRegional = regionalContent.summary;
  } else {
    whyMeRegional = [
      `இந்த திட்டம் உங்கள் வயது (${profile.age}), தொழில் (${profile.occupation}) மற்றும் இருப்பிடத்திற்கு பொருத்தமானது.`
    ];
    simpleExplanationRegional = scheme.summarySimple;
  }

  return {
    scheme,
    score: finalScore,
    matchLevel,
    criteriaBreakdown: {
      age: ageMatch,
      occupation: occupationMatch,
      income: incomeMatch,
      location: locationMatch,
      gender: genderMatch,
      documents: 'READY',
      student: profile.isStudent,
    },
    matchedPoints,
    pendingPoints,
    whyMeEnglish,
    whyMeRegional,
    simpleExplanationEnglish: scheme.summarySimple,
    simpleExplanationRegional,
  };
}

export function matchUserSchemes(profile: UserProfile, schemeDatabase: Scheme[] = SCHEMES_DATABASE): MatchResult[] {
  const results = schemeDatabase.map((scheme) => evaluateSchemeEligibility(scheme, profile));

  // Sort by match score descending, then prioritize state-specific then central
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // if equal, state-specific prioritized
    if (a.scheme.stateId !== 'ALL' && b.scheme.stateId === 'ALL') return -1;
    if (b.scheme.stateId !== 'ALL' && a.scheme.stateId === 'ALL') return 1;
    return 0;
  });

  return results;
}
