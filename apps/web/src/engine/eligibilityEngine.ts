import { Scheme, UserProfile, MatchResult, EligibilityStatus } from '../types';

export function evaluateSchemeEligibility(scheme: Scheme, profile: UserProfile | null): MatchResult {
  if (!profile || !scheme) {
    return {
      scheme: scheme || ({} as Scheme),
      score: 0,
      matchLevel: 'MORE_INFO',
      status: 'NO_DATA',
      criteriaBreakdown: {
        age: false,
        occupation: false,
        income: false,
        location: false,
        gender: false,
        documents: 'MISSING',
      },
      matchedPoints: [],
      pendingPoints: ['User profile information is required to evaluate eligibility.'],
      whyMeEnglish: ['Profile details missing.'],
      whyMeRegional: [],
      simpleExplanationEnglish: scheme?.summarySimple || '',
      simpleExplanationRegional: '',
    };
  }

  let matchedPoints: string[] = [];
  let pendingPoints: string[] = [];
  let whyMeEnglish: string[] = [];
  let whyMeRegional: string[] = [];

  let scoreWeight = 0;
  let totalWeight = 0;

  // 1. Location / State Check (Weight: 25)
  totalWeight += 25;
  let locationMatch = false;
  if (!profile.state) {
    pendingPoints.push('State location not specified in profile.');
  } else if (scheme.stateId === 'ALL' || scheme.state === 'ALL') {
    locationMatch = true;
    scoreWeight += 25;
    matchedPoints.push(`Applicable nationwide (Central Scheme) in all states including ${profile.state}`);
    whyMeEnglish.push(`✓ State match: Applicable as a Central Government scheme in ${profile.state}.`);
  } else if (scheme.stateId === profile.state || scheme.state === profile.state) {
    locationMatch = true;
    scoreWeight += 25;
    matchedPoints.push(`Applicable in your state (${profile.state})`);
    whyMeEnglish.push(`✓ State match: Explicitly applicable in ${profile.state}.`);
  } else {
    locationMatch = false;
    pendingPoints.push(`Scheme is specific to state ${scheme.stateId || scheme.state}, but user state is ${profile.state}`);
  }

  // 2. Need / Category Relevance (Weight: 20)
  totalWeight += 20;
  let categoryMatch = false;
  if (!profile.need || profile.need === 'general') {
    categoryMatch = true;
    scoreWeight += 15;
    matchedPoints.push(`Category: ${scheme.category?.replace('_', ' ').toUpperCase() || 'General'}`);
  } else if (profile.need === scheme.category) {
    categoryMatch = true;
    scoreWeight += 20;
    matchedPoints.push(`Matches your stated need: ${scheme.category.replace('_', ' ').toUpperCase()}`);
    whyMeEnglish.push(`✓ Need alignment: Matches your stated interest in ${scheme.category.replace('_', ' ')}.`);
  } else if (
    scheme.eligibility.targetCategories &&
    scheme.eligibility.targetCategories.includes(profile.need as any)
  ) {
    categoryMatch = true;
    scoreWeight += 18;
    matchedPoints.push('Secondary match for your stated need');
    whyMeEnglish.push('✓ Need alignment: Relevant secondary benefit category.');
  } else {
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
    whyMeEnglish.push(`✓ Occupation: Open to all occupations (your occupation: ${profile.occupation || 'Unspecified'}).`);
  } else if (!profile.occupation) {
    pendingPoints.push(`Scheme requires specified occupation: ${scheme.eligibility.allowedOccupations.join(', ')}`);
  } else {
    const userOcc = profile.occupation.toLowerCase().trim();
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
      matchedPoints.push(`Occupation matches criteria: ${profile.occupation}`);
      whyMeEnglish.push(`✓ Occupation: Matches ${profile.occupation} criteria.`);
    } else {
      pendingPoints.push(`Targets occupations: ${scheme.eligibility.allowedOccupations.join(', ')}`);
      whyMeEnglish.push(`⚠ Occupation check: Targets ${scheme.eligibility.allowedOccupations.slice(0, 3).join(', ')}.`);
    }
  }

  // 4. Age Criteria (Weight: 15)
  totalWeight += 15;
  let ageMatch = true;
  const userAge = profile.age || 0;
  if (userAge <= 0 && (scheme.eligibility.minAge || scheme.eligibility.maxAge)) {
    ageMatch = false;
    pendingPoints.push('Age not provided in profile.');
  } else {
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
  }

  // 5. Income Criteria (Weight: 15)
  totalWeight += 15;
  let incomeMatch = true;
  if (scheme.eligibility.maxAnnualIncome) {
    if (profile.annualIncome !== undefined && profile.annualIncome <= scheme.eligibility.maxAnnualIncome) {
      scoreWeight += 15;
      matchedPoints.push(`Annual income (₹${profile.annualIncome.toLocaleString('en-IN')}) is within ₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')} limit`);
      whyMeEnglish.push(`✓ Income: Reported income of ₹${profile.annualIncome.toLocaleString('en-IN')} is within the limit (₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')}).`);
    } else if (profile.annualIncome !== undefined && profile.annualIncome > scheme.eligibility.maxAnnualIncome) {
      incomeMatch = false;
      pendingPoints.push(`Annual income limit is ₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')} (User reported: ₹${profile.annualIncome.toLocaleString('en-IN')})`);
      whyMeEnglish.push(`⚠ Income limit: Scheme lists limit of ₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')}.`);
    } else {
      incomeMatch = false;
      pendingPoints.push(`Income limit is ₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')}`);
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
      } else if (profile.gender && profile.gender !== 'unspecified') {
        scoreWeight += 5;
        matchedPoints.push('Gender requirement matched');
        whyMeEnglish.push(`✓ Gender: Requirement matched (${profile.gender}).`);
      } else {
        pendingPoints.push(`Targeted towards: ${scheme.eligibility.targetGenders.join(', ')}`);
      }
    } else {
      scoreWeight += 5;
    }
  } else {
    scoreWeight += 5;
  }

  // Calculate percentage score strictly from weights
  const finalScore = totalWeight > 0 ? Math.min(100, Math.round((scoreWeight / totalWeight) * 100)) : 0;

  // Determine Match Level and Eligibility Status
  let matchLevel: 'STRONG' | 'POTENTIAL' | 'MORE_INFO' = 'POTENTIAL';
  let status: EligibilityStatus = 'NOT_ELIGIBLE';

  if (!profile.age && !profile.occupation && !profile.annualIncome) {
    status = 'NEEDS_INFORMATION';
    matchLevel = 'MORE_INFO';
  } else if (finalScore >= 80 && locationMatch && ageMatch && incomeMatch) {
    matchLevel = 'STRONG';
    status = 'ELIGIBLE';
  } else if (finalScore >= 50 && locationMatch) {
    matchLevel = 'POTENTIAL';
    status = 'NEEDS_INFORMATION';
  } else {
    matchLevel = 'MORE_INFO';
    status = 'NOT_ELIGIBLE';
  }

  // Regional language explanation
  const voiceLang = profile.voiceLanguage || 'ta';
  const regionalContent = scheme.languageContent?.[voiceLang];
  let simpleExplanationRegional = '';

  if (regionalContent) {
    whyMeRegional = [
      regionalContent.whyMatchTemplate,
    ];
    simpleExplanationRegional = regionalContent.summary;
  } else {
    simpleExplanationRegional = scheme.summarySimple || '';
  }

  return {
    scheme,
    score: finalScore,
    matchLevel,
    status,
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
    simpleExplanationEnglish: scheme.summarySimple || '',
    simpleExplanationRegional,
  };
}

export function matchUserSchemes(profile: UserProfile | null, schemes: Scheme[] = []): MatchResult[] {
  if (!schemes || schemes.length === 0 || !profile) {
    return [];
  }

  // Filter schemes to only those that apply to the user's selected state or are All-India Central schemes
  const applicableSchemes = schemes.filter((scheme) => {
    if (!profile.state || profile.state === 'ALL') return true;
    return (
      scheme.stateId === 'ALL' ||
      scheme.stateId === profile.state ||
      scheme.state === 'ALL' ||
      scheme.state === profile.state
    );
  });

  const results = applicableSchemes.map((scheme) => evaluateSchemeEligibility(scheme, profile));

  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const aIsState = a.scheme.stateId !== 'ALL' && a.scheme.state !== 'ALL';
    const bIsState = b.scheme.stateId !== 'ALL' && b.scheme.state !== 'ALL';
    if (aIsState && !bIsState) return -1;
    if (!aIsState && bIsState) return 1;
    return 0;
  });

  return results;
}
