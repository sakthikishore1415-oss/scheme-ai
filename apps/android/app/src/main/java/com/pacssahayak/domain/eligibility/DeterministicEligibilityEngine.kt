package com.pacssahayak.domain.eligibility

import com.pacssahayak.data.model.CitizenProfile
import com.pacssahayak.data.model.CriteriaBreakdown
import com.pacssahayak.data.model.EligibilityResult
import com.pacssahayak.data.model.EligibilityStatus
import com.pacssahayak.data.model.MatchLevel
import com.pacssahayak.data.model.Scheme

/**
 * Deterministic Eligibility Engine (Kotlin Native)
 * Implements the authoritative evaluation rules defined in @pacs-sahayak/eligibility-spec.
 * Pure deterministic rule checks — No AI decision-making.
 */
object DeterministicEligibilityEngine {

    fun evaluate(profile: CitizenProfile?, scheme: Scheme): EligibilityResult {
        if (profile == null) {
            return EligibilityResult(
                scheme = scheme,
                score = 0,
                matchLevel = MatchLevel.MORE_INFO,
                status = EligibilityStatus.NO_DATA,
                criteriaBreakdown = CriteriaBreakdown(
                    age = false,
                    income = false,
                    occupation = false,
                    location = false
                ),
                whyMeEnglish = listOf("Please complete your profile to verify eligibility."),
                whyMeRegional = listOf("தகுதி அறிய உங்கள் விவரங்களை பதிவு செய்யவும்."),
                matchedPoints = emptyList(),
                pendingPoints = listOf("Profile setup required")
            )
        }

        val rules = scheme.eligibility
        val matchedPoints = mutableListOf<String>()
        val pendingPoints = mutableListOf<String>()
        val whyMeEnglish = mutableListOf<String>()
        val whyMeRegional = mutableListOf<String>()

        // 1. Mandatory Disqualifier Checks
        var isAgeDisqualified = false
        if (rules.minAge != null && profile.age > 0 && profile.age < rules.minAge) {
            isAgeDisqualified = true
            pendingPoints.add("Minimum age required is ${rules.minAge} years (Reported: ${profile.age})")
        }
        if (rules.maxAge != null && profile.age > rules.maxAge) {
            isAgeDisqualified = true
            pendingPoints.add("Maximum age limit is ${rules.maxAge} years (Reported: ${profile.age})")
        }

        var isIncomeDisqualified = false
        if (rules.maxAnnualIncome != null && profile.annualIncome > rules.maxAnnualIncome) {
            isIncomeDisqualified = true
            pendingPoints.add("Annual income must be within ₹${rules.maxAnnualIncome} (Reported: ₹${profile.annualIncome})")
        }

        var isLocationDisqualified = false
        if (scheme.stateId != "ALL" && !profile.state.equals(scheme.stateId, ignoreCase = true)) {
            isLocationDisqualified = true
            pendingPoints.add("Applicable only for ${scheme.stateId} residents (Selected: ${profile.state})")
        }

        var isGenderDisqualified = false
        if (!rules.genders.isNullOrEmpty() && profile.gender != "all" && !rules.genders.contains(profile.gender)) {
            isGenderDisqualified = true
            pendingPoints.add("Scheme is designated for ${rules.genders.joinToString(", ")} applicants")
        }

        val isHardDisqualified = isAgeDisqualified || isIncomeDisqualified || isLocationDisqualified || isGenderDisqualified

        if (isHardDisqualified) {
            return EligibilityResult(
                scheme = scheme,
                score = 0,
                matchLevel = MatchLevel.INELIGIBLE,
                status = EligibilityStatus.NOT_ELIGIBLE,
                criteriaBreakdown = CriteriaBreakdown(
                    age = !isAgeDisqualified,
                    income = !isIncomeDisqualified,
                    occupation = false,
                    location = !isLocationDisqualified,
                    gender = !isGenderDisqualified
                ),
                whyMeEnglish = listOf("Does not meet minimum statutory criteria."),
                whyMeRegional = listOf("அரசு விதிகளின்படி இந்த திட்டத்திற்கான தகுதி பொருந்தவில்லை."),
                matchedPoints = emptyList(),
                pendingPoints = pendingPoints
            )
        }

        // 2. Scoring Calculation (Max 100 Points)
        var score = 0

        // Location Check (20 pts)
        val locationMatch = scheme.stateId == "ALL" || profile.state.equals(scheme.stateId, ignoreCase = true)
        if (locationMatch) {
            score += 20
            matchedPoints.add("Location: Valid for ${if (scheme.stateId == "ALL") "All India" else profile.state}")
            whyMeEnglish.add("✓ Resident of ${profile.state} (Eligible for ${if (scheme.stateId == "ALL") "Central" else scheme.stateId} scheme)")
            whyMeRegional.add("✓ ${profile.state} மாநில இருப்பிட தகுதி பொருந்துகிறது.")
        }

        // Occupation Check (35 pts)
        var occupationMatch = false
        if (rules.allowedOccupations.isNullOrEmpty()) {
            occupationMatch = true
            score += 35
            matchedPoints.add("Occupation: Open to all occupations")
            whyMeEnglish.add("✓ Open to all occupational categories")
            whyMeRegional.add("✓ அனைத்து தொழில் பிரிவினருக்கும் பொருந்தும்.")
        } else if (profile.occupation.isNotBlank()) {
            val occLower = profile.occupation.lowercase()
            val matchesOcc = rules.allowedOccupations.any { allowed ->
                val allowedLower = allowed.lowercase()
                occLower.contains(allowedLower) || allowedLower.contains(occLower)
            }
            if (matchesOcc) {
                occupationMatch = true
                score += 35
                matchedPoints.add("Occupation: ${profile.occupation} qualifies")
                whyMeEnglish.add("✓ Occupation '${profile.occupation}' matches target beneficiary list")
                whyMeRegional.add("✓ '${profile.occupation}' தொழில் தகுதி பட்டியலில் உள்ளது.")
            } else {
                pendingPoints.add("Designated primarily for: ${rules.allowedOccupations.joinToString(", ")}")
            }
        }

        // Income Compliance Check (25 pts)
        var incomeMatch = false
        if (rules.maxAnnualIncome == null) {
            incomeMatch = true
            score += 25
            matchedPoints.add("Income: No income ceiling restriction")
            whyMeEnglish.add("✓ No restrictive annual income limit")
            whyMeRegional.add("✓ குறிப்பிட்ட வருமான வரம்பு கட்டுப்பாடு இல்லை.")
        } else if (profile.annualIncome > 0 && profile.annualIncome <= rules.maxAnnualIncome) {
            incomeMatch = true
            score += 25
            matchedPoints.add("Income: ₹${profile.annualIncome} is within ₹${rules.maxAnnualIncome} ceiling")
            whyMeEnglish.add("✓ Annual income ₹${profile.annualIncome} is within ₹${rules.maxAnnualIncome} limit")
            whyMeRegional.add("✓ குடும்ப ஆண்டு வருமானம் நிர்ணயிக்கப்பட்ட வரம்பிற்குள் உள்ளது.")
        }

        // Age Compliance Check (20 pts)
        var ageMatch = false
        if (rules.minAge == null && rules.maxAge == null) {
            ageMatch = true
            score += 20
            matchedPoints.add("Age: No specific age restrictions")
            whyMeEnglish.add("✓ Applicable to all age groups")
            whyMeRegional.add("✓ அனைத்து வயதினருக்கும் பொருந்தும்.")
        } else if (profile.age in (rules.minAge ?: 0)..(rules.maxAge ?: 150)) {
            ageMatch = true
            score += 20
            matchedPoints.add("Age: ${profile.age} years satisfies age criteria")
            whyMeEnglish.add("✓ Age (${profile.age} yrs) satisfies age requirements")
            whyMeRegional.add("✓ உங்கள் வயது (${profile.age}) தகுதி வரம்பிற்குள் உள்ளது.")
        }

        // Categorize Match
        val matchLevel = when {
            score >= 80 -> MatchLevel.STRONG
            score >= 50 -> MatchLevel.POTENTIAL
            score > 0 -> MatchLevel.MORE_INFO
            else -> MatchLevel.INELIGIBLE
        }

        val status = when (matchLevel) {
            MatchLevel.STRONG, MatchLevel.POTENTIAL -> EligibilityStatus.ELIGIBLE
            MatchLevel.MORE_INFO -> EligibilityStatus.NEEDS_INFORMATION
            MatchLevel.INELIGIBLE -> EligibilityStatus.NOT_ELIGIBLE
        }

        return EligibilityResult(
            scheme = scheme,
            score = score,
            matchLevel = matchLevel,
            status = status,
            criteriaBreakdown = CriteriaBreakdown(
                age = ageMatch,
                income = incomeMatch,
                occupation = occupationMatch,
                location = locationMatch,
                gender = !isGenderDisqualified
            ),
            whyMeEnglish = whyMeEnglish,
            whyMeRegional = whyMeRegional,
            matchedPoints = matchedPoints,
            pendingPoints = pendingPoints
        )
    }

    fun evaluateAll(profile: CitizenProfile?, schemes: List<Scheme>): List<EligibilityResult> {
        val applicableSchemes = if (profile?.state != null && profile.state != "ALL") {
            schemes.filter { it.stateId == "ALL" || it.stateId.equals(profile.state, ignoreCase = true) }
        } else {
            schemes
        }
        return applicableSchemes.map { evaluate(profile, it) }
            .sortedByDescending { it.score }
    }
}

