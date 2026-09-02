export type NeedCategory =
  | 'agriculture'
  | 'education'
  | 'housing'
  | 'employment'
  | 'women'
  | 'senior_citizens'
  | 'disability'
  | 'health'
  | 'financial'
  | 'business';

export type SchemeType = 'central' | 'state' | 'regional';

export type EligibilityStatus = 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFORMATION' | 'NO_DATA';

export interface SchemeFilters {
  stateId?: string;
  category?: NeedCategory | string;
  searchQuery?: string;
}

export interface StateConfig {
  id: string;
  name: string;
  nativeName: string;
  supportedLanguages: string[]; // e.g. ['ta', 'en']
  defaultVoiceLanguage: string; // e.g. 'ta'
  districts: string[];
  popularNeeds: NeedCategory[];
  flagEmblemHint?: string;
}

export interface LanguageConfig {
  id: string;
  name: string;
  nativeName: string;
  bcp47Code: string; // e.g. 'ta-IN'
  voiceSupport: boolean;
  ttsSupport: boolean;
  samplePhrase: string;
  sampleTranscription: string;
}

export interface EligibilityRule {
  minAge?: number;
  maxAge?: number;
  allowedOccupations?: string[];
  maxAnnualIncome?: number; // In INR (e.g. 200000)
  targetGenders?: ('all' | 'female' | 'male' | 'other')[];
  applicableStates?: string[]; // ['ALL'] or state ids like ['TN']
  targetCategories?: NeedCategory[];
  requiresDisability?: boolean;
  requiresLandHoldingMaxAcres?: number;
  requiresStudent?: boolean;
  requiresSeniorCitizen?: boolean;
  educationMinLevel?: 'none' | '10th' | '12th' | 'graduate' | 'any';
  specialConditions?: string[];
}

export interface SchemeBenefit {
  amount?: string;
  frequency?: string;
  type: 'cash_transfer' | 'subsidy' | 'insurance' | 'scholarship' | 'pension' | 'loan' | 'in_kind';
  shortSummary: string;
  detailedBenefit: string;
}

export interface SchemeDocument {
  id: string;
  name: string;
  isMandatory: boolean;
  description: string;
}

export interface Scheme {
  id: string;
  name: string;
  nativeName?: string;
  department: string;
  authority?: string;
  schemeType: SchemeType;
  stateId: string; // 'ALL' for central, or 'TN', 'KL', etc.
  state?: string;
  category: NeedCategory;
  beneficiaryType?: string[];
  eligibility: EligibilityRule;
  benefits: SchemeBenefit;
  documents: SchemeDocument[];
  applicationSteps: string[];
  applicationUrl?: string;
  offlineApplicationCenter?: string;
  officialSource: string;
  lastVerified: string;
  verifiedStatus?: 'VERIFIED_OFFICIAL' | 'NO_DATA';
  summarySimple: string; // Plain citizen-friendly language
  languageContent?: Record<
    string,
    {
      summary: string;
      voiceExplanation: string;
      whyMatchTemplate: string;
      simpleBenefit: string;
    }
  >;
}

export interface UserProfile {
  userId: string;
  name: string;
  age: number;
  gender: 'female' | 'male' | 'other' | 'unspecified';
  state: string; // stateId e.g. 'TN'
  district: string;
  occupation: string;
  annualIncome: number; // in INR
  education: 'none' | '10th' | '12th' | 'graduate' | 'other';
  maritalStatus: 'unmarried' | 'married' | 'widowed' | 'divorced' | 'unspecified';
  isStudent: boolean;
  hasDisability: boolean;
  landHoldingAcres: number;
  need: NeedCategory | 'general';
  customNeedDescription?: string;
  voiceLanguage: string; // languageId e.g. 'ta'
  familyRole?: string; // 'Self', 'Mother', 'Father', 'Daughter', 'Son'
}

export interface MatchResult {
  scheme: Scheme;
  score: number; // 0 to 100
  matchLevel: 'STRONG' | 'POTENTIAL' | 'MORE_INFO';
  status: EligibilityStatus;
  criteriaBreakdown: {
    age: boolean;
    occupation: boolean;
    income: boolean;
    location: boolean;
    gender: boolean;
    documents: 'READY' | 'PARTIAL' | 'MISSING';
    student?: boolean;
    special?: boolean;
  };
  matchedPoints: string[];
  pendingPoints: string[];
  whyMeEnglish: string[];
  whyMeRegional: string[];
  simpleExplanationEnglish: string;
  simpleExplanationRegional: string;
}

export interface FamilyMemberProfile {
  id: string;
  relation: string; // 'Self' | 'Mother' | 'Father' | 'Daughter' | 'Son' | 'Spouse'
  name: string;
  profile: UserProfile;
}

export interface CitizenCallSession {
  sessionId: string;
  citizenName: string;
  device: string;
  stateId: string;
  voiceLanguage: string;
  need: string;
  profile: Partial<UserProfile>;
  matchesCount: number;
  topMatchName: string;
  topMatchBenefit: string;
  status: string;
  timestamp: string;
  ivrSteps: string[];
}

export type ViewTab =
  | 'home'
  | 'ask'
  | 'matches'
  | 'saved'
  | 'profile'
  | 'button_phone'
  | 'sms'
  | 'family'
  | 'assisted'
  | 'documents'
  | 'architecture';
