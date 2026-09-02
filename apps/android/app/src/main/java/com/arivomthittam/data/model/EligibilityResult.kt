package com.arivomthittam.data.model

enum class EligibilityStatus {
    ELIGIBLE,
    NOT_ELIGIBLE,
    NEEDS_INFORMATION,
    NO_DATA
}

enum class MatchLevel {
    STRONG,
    POTENTIAL,
    MORE_INFO,
    INELIGIBLE
}

data class CriteriaBreakdown(
    val age: Boolean,
    val income: Boolean,
    val occupation: Boolean,
    val location: Boolean,
    val gender: Boolean = true,
    val land: Boolean = true
)

data class EligibilityResult(
    val scheme: Scheme,
    val score: Int,
    val matchLevel: MatchLevel,
    val status: EligibilityStatus,
    val criteriaBreakdown: CriteriaBreakdown,
    val whyMeEnglish: List<String>,
    val whyMeRegional: List<String>,
    val matchedPoints: List<String>,
    val pendingPoints: List<String>
)

