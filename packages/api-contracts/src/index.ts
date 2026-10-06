/**
 * PACS Sahayak — Shared API Contracts & Models
 * Authoritative data structures for both Web (TypeScript) and Android (Kotlin).
 */

export type EligibilityStatus = 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFORMATION' | 'NO_DATA';

export type MatchLevel = 'STRONG' | 'POTENTIAL' | 'MORE_INFO' | 'INELIGIBLE';

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

/**
 * Equivalent Kotlin:
 * ```kotlin
 * data class CitizenProfile(
 *     val name: String? = null,
 *     val age: Int = 0,
 *     val gender: String = "all",
 *     val state: String = "TN",
 *     val district: String = "",
 *     val occupation: String = "",
 *     val annualIncome: Long = 0L,
 *     val landHoldingAcres: Double? = 0.0,
 *     val disability: Boolean = false,
 *     val need: String = "general"
 * )
 * ```
 */
export interface CitizenProfile {
  id?: string;
  name?: string;
  age: number;
  gender: 'male' | 'female' | 'transgender' | 'all';
  state: string;
  district: string;
  occupation: string;
  annualIncome: number;
  landHoldingAcres?: number;
  disability?: boolean;
  community?: 'SC' | 'ST' | 'OBC' | 'MBC' | 'GENERAL';
  maritalStatus?: 'single' | 'married' | 'widowed' | 'deserted';
  familyMembersCount?: number;
  need?: NeedCategory | 'general';
  voiceLanguage?: string;
}

/**
 * Equivalent Kotlin:
 * ```kotlin
 * data class FamilyMember(
 *     val id: String,
 *     val name: String,
 *     val relationship: String,
 *     val age: Int,
 *     val occupation: String,
 *     val gender: String
 * )
 * ```
 */
export interface FamilyMember {
  id: string;
  name: string;
  relationship: 'Self' | 'Spouse' | 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Grandparent' | 'Other';
  age: number;
  occupation: string;
  gender: 'male' | 'female' | 'other';
  annualIncome?: number;
}

export interface DocumentRequirement {
  name: string;
  mandatory: boolean;
  description: string;
}

export interface SchemeBenefit {
  type: 'direct_cash' | 'subsidy' | 'insurance' | 'pension' | 'loan' | 'in_kind' | 'scholarship' | 'training';
  amount?: string;
  shortSummary: string;
  detailedBenefit: string;
  frequency?: 'Monthly' | 'Annual' | 'One-Time' | 'Per Hectare' | 'As Needed';
}

export interface EligibilityRules {
  minAge?: number;
  maxAge?: number;
  genders?: string[];
  maxAnnualIncome?: number;
  allowedOccupations?: string[];
  requiresDisability?: boolean;
  requiredCommunities?: string[];
  maxLandHoldingAcres?: number;
  requiresLandOwnership?: boolean;
  allowedMaritalStatus?: string[];
}

/**
 * Equivalent Kotlin:
 * ```kotlin
 * data class Scheme(
 *     val id: String,
 *     val name: String,
 *     val nativeName: String? = null,
 *     val authority: String,
 *     val department: String,
 *     val stateId: String,
 *     val schemeType: String,
 *     val summarySimple: String,
 *     val benefits: SchemeBenefit,
 *     val eligibility: EligibilityRules,
 *     val documents: List<DocumentRequirement>,
 *     val applicationSteps: List<String>,
 *     val officialSource: String,
 *     val lastVerified: String? = null
 * )
 * ```
 */
export interface Scheme {
  id: string;
  name: string;
  nativeName?: string;
  authority: string;
  department: string;
  stateId: string;
  state?: string;
  schemeType: 'central' | 'state';
  category: NeedCategory;
  summarySimple: string;
  benefits: SchemeBenefit;
  eligibility: EligibilityRules;
  documents: DocumentRequirement[];
  applicationSteps: string[];
  offlineApplicationCenter?: string;
  applicationUrl?: string;
  officialSource: string;
  lastVerified?: string;
  languageContent?: Record<string, {
    title: string;
    summary: string;
    voiceExplanation: string;
    simpleRoadmap: string[];
  }>;
}

export interface CriterionResult {
  criterion: string;
  satisfied: boolean;
  userValue: any;
  requiredRule: any;
  message: string;
}

/**
 * Equivalent Kotlin:
 * ```kotlin
 * data class EligibilityResult(
 *     val scheme: Scheme,
 *     val score: Int,
 *     val matchLevel: MatchLevel,
 *     val status: EligibilityStatus,
 *     val whyMeEnglish: List<String>,
 *     val whyMeRegional: List<String>,
 *     val matchedPoints: List<String>,
 *     val pendingPoints: List<String>
 * )
 * ```
 */
export interface EligibilityResult {
  scheme: Scheme;
  score: number;
  matchLevel: MatchLevel;
  status: EligibilityStatus;
  criteriaBreakdown: {
    age: boolean;
    income: boolean;
    occupation: boolean;
    location: boolean;
    gender: boolean;
    land: boolean;
  };
  whyMeEnglish: string[];
  whyMeRegional: string[];
  matchedPoints: string[];
  pendingPoints: string[];
}

export interface SchemeFilters {
  state?: string;
  category?: NeedCategory | string;
  query?: string;
  minAge?: number;
  maxIncome?: number;
  occupation?: string;
}

