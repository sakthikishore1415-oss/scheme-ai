package com.arivomthittam.data.model

data class DocumentRequirement(
    val name: String,
    val mandatory: Boolean,
    val description: String
)

data class SchemeBenefit(
    val type: String, // "direct_cash", "subsidy", "insurance", "pension", "loan", "scholarship"
    val amount: String? = null,
    val shortSummary: String,
    val detailedBenefit: String,
    val frequency: String? = null
)

data class EligibilityRules(
    val minAge: Int? = null,
    val maxAge: Int? = null,
    val genders: List<String>? = null,
    val maxAnnualIncome: Long? = null,
    val allowedOccupations: List<String>? = null,
    val requiresDisability: Boolean? = null,
    val requiredCommunities: List<String>? = null,
    val maxLandHoldingAcres: Double? = null,
    val requiresLandOwnership: Boolean? = null,
    val allowedMaritalStatus: List<String>? = null
)

data class LanguageContent(
    val title: String,
    val summary: String,
    val voiceExplanation: String,
    val simpleRoadmap: List<String>
)

data class Scheme(
    val id: String,
    val name: String,
    val nativeName: String? = null,
    val authority: String,
    val department: String,
    val stateId: String,
    val schemeType: String, // "central" or "state"
    val category: String,
    val summarySimple: String,
    val benefits: SchemeBenefit,
    val eligibility: EligibilityRules,
    val documents: List<DocumentRequirement>,
    val applicationSteps: List<String>,
    val offlineApplicationCenter: String? = null,
    val applicationUrl: String? = null,
    val officialSource: String,
    val lastVerified: String? = null,
    val languageContent: Map<String, LanguageContent>? = null
)

