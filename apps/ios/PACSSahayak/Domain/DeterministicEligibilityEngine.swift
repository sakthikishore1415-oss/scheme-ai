import Foundation

/// Pure deterministic eligibility engine for iOS (Swift)
/// Strictly mirrors the authoritative logic defined in @pacs-sahayak/eligibility-spec
/// Zero LLM hallucination guarantee.
public struct DeterministicEligibilityEngine {

    public static func evaluate(profile: CitizenProfile?, scheme: Scheme) -> EligibilityResult {
        guard let profile = profile else {
            return EligibilityResult(
                scheme: scheme,
                score: 0,
                matchLevel: .moreInfo,
                status: .noData,
                criteriaBreakdown: CriteriaBreakdown(
                    age: false,
                    income: false,
                    occupation: false,
                    location: false
                ),
                whyMeEnglish: ["Please complete your profile to verify eligibility."],
                whyMeRegional: ["தகுதி அறிய உங்கள் விவரங்களை பதிவு செய்யவும்."],
                matchedPoints: [],
                pendingPoints: ["Profile setup required"]
            )
        }

        let rules = scheme.eligibility
        var matchedPoints: [String] = []
        var pendingPoints: [String] = []
        var whyMeEnglish: [String] = []
        var whyMeRegional: [String] = []

        // 1. Mandatory Disqualifier Checks
        var isAgeDisqualified = false
        if let minAge = rules.minAge, profile.age > 0 && profile.age < minAge {
            isAgeDisqualified = true
            pendingPoints.append("Minimum age required is \(minAge) years (Reported: \(profile.age))")
        }
        if let maxAge = rules.maxAge, profile.age > maxAge {
            isAgeDisqualified = true
            pendingPoints.append("Maximum age limit is \(maxAge) years (Reported: \(profile.age))")
        }

        var isIncomeDisqualified = false
        if let maxIncome = rules.maxAnnualIncome, profile.annualIncome > maxIncome {
            isIncomeDisqualified = true
            pendingPoints.append("Annual income must be within ₹\(maxIncome) (Reported: ₹\(profile.annualIncome))")
        }

        var isLocationDisqualified = false
        if scheme.stateId != "ALL" && scheme.stateId.caseInsensitiveCompare(profile.state) != .orderedSame {
            isLocationDisqualified = true
            pendingPoints.append("Applicable only for \(scheme.stateId) residents (Selected: \(profile.state))")
        }

        var isGenderDisqualified = false
        if let allowedGenders = rules.genders, !allowedGenders.isEmpty, profile.gender != "all" {
            let isAllowed = allowedGenders.contains { $0.caseInsensitiveCompare(profile.gender) == .orderedSame }
            if !isAllowed {
                isGenderDisqualified = true
                pendingPoints.append("Scheme is designated for \(allowedGenders.joined(separator: ", ")) applicants")
            }
        }

        let isHardDisqualified = isAgeDisqualified || isIncomeDisqualified || isLocationDisqualified || isGenderDisqualified

        if isHardDisqualified {
            return EligibilityResult(
                scheme: scheme,
                score: 0,
                matchLevel: .ineligible,
                status: .notEligible,
                criteriaBreakdown: CriteriaBreakdown(
                    age: !isAgeDisqualified,
                    income: !isIncomeDisqualified,
                    occupation: false,
                    location: !isLocationDisqualified,
                    gender: !isGenderDisqualified
                ),
                whyMeEnglish: ["Does not meet minimum statutory criteria."],
                whyMeRegional: ["அரசு விதிகளின்படி இந்த திட்டத்திற்கான தகுதி பொருந்தவில்லை."],
                matchedPoints: [],
                pendingPoints: pendingPoints
            )
        }

        // 2. Scoring Calculation (Max 100 Points)
        var score = 0

        // Location Check (20 pts)
        let locationMatch = scheme.stateId == "ALL" || scheme.stateId.caseInsensitiveCompare(profile.state) == .orderedSame
        if locationMatch {
            score += 20
            matchedPoints.append("Location: Valid for \(scheme.stateId == "ALL" ? "All India" : profile.state)")
            whyMeEnglish.append("✓ Resident of \(profile.state) (Eligible for \(scheme.stateId == "ALL" ? "Central" : scheme.stateId) scheme)")
            whyMeRegional.append("✓ \(profile.state) மாநில இருப்பிட தகுதி பொருந்துகிறது.")
        }

        // Occupation Check (35 pts)
        var occupationMatch = false
        if let allowedOccupations = rules.allowedOccupations, !allowedOccupations.isEmpty {
            if !profile.occupation.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                let userOcc = profile.occupation.lowercased()
                let matches = allowedOccupations.contains { allowed in
                    let lower = allowed.lowercased()
                    return userOcc.contains(lower) || lower.contains(userOcc)
                }
                if matches {
                    occupationMatch = true
                    score += 35
                    matchedPoints.append("Occupation: \(profile.occupation) qualifies")
                    whyMeEnglish.append("✓ Occupation '\(profile.occupation)' matches target beneficiary list")
                    whyMeRegional.append("✓ '\(profile.occupation)' தொழில் தகுதி பட்டியலில் உள்ளது.")
                } else {
                    pendingPoints.append("Designated primarily for: \(allowedOccupations.joined(separator: ", "))")
                }
            }
        } else {
            // Open to all occupations
            occupationMatch = true
            score += 35
            matchedPoints.append("Occupation: Open to all occupations")
            whyMeEnglish.append("✓ Open to all occupational categories")
            whyMeRegional.append("✓ அனைத்து தொழில் பிரிவினருக்கும் பொருந்தும்.")
        }

        // Income Compliance Check (25 pts)
        var incomeMatch = false
        if let maxIncome = rules.maxAnnualIncome {
            if profile.annualIncome > 0 && profile.annualIncome <= maxIncome {
                incomeMatch = true
                score += 25
                matchedPoints.append("Income: ₹\(profile.annualIncome) is within ₹\(maxIncome) ceiling")
                whyMeEnglish.append("✓ Annual income ₹\(profile.annualIncome) is within ₹\(maxIncome) limit")
                whyMeRegional.append("✓ குடும்ப ஆண்டு வருமானம் நிர்ணயிக்கப்பட்ட வரம்பிற்குள் உள்ளது.")
            }
        } else {
            incomeMatch = true
            score += 25
            matchedPoints.append("Income: No income ceiling restriction")
            whyMeEnglish.append("✓ No restrictive annual income limit")
            whyMeRegional.append("✓ குறிப்பிட்ட வருமான வரம்பு கட்டுப்பாடு இல்லை.")
        }

        // Age Compliance Check (20 pts)
        var ageMatch = false
        let min = rules.minAge ?? 0
        let max = rules.maxAge ?? 150
        if rules.minAge == nil && rules.maxAge == nil {
            ageMatch = true
            score += 20
            matchedPoints.append("Age: No specific age restrictions")
            whyMeEnglish.append("✓ Applicable to all age groups")
            whyMeRegional.append("✓ அனைத்து வயதினருக்கும் பொருந்தும்.")
        } else if profile.age >= min && profile.age <= max {
            ageMatch = true
            score += 20
            matchedPoints.append("Age: \(profile.age) years satisfies age criteria")
            whyMeEnglish.append("✓ Age (\(profile.age) yrs) satisfies age requirements")
            whyMeRegional.append("✓ உங்கள் வயது (\(profile.age)) தகுதி வரம்பிற்குள் உள்ளது.")
        }

        // Match Level
        let matchLevel: MatchLevel
        if score >= 80 {
            matchLevel = .strong
        } else if score >= 50 {
            matchLevel = .potential
        } else if score > 0 {
            matchLevel = .moreInfo
        } else {
            matchLevel = .ineligible
        }

        let status: EligibilityStatus
        switch matchLevel {
        case .strong, .potential:
            status = .eligible
        case .moreInfo:
            status = .needsInformation
        case .ineligible:
            status = .notEligible
        }

        return EligibilityResult(
            scheme: scheme,
            score: score,
            matchLevel: matchLevel,
            status: status,
            criteriaBreakdown: CriteriaBreakdown(
                age: ageMatch,
                income: incomeMatch,
                occupation: occupationMatch,
                location: locationMatch,
                gender: !isGenderDisqualified
            ),
            whyMeEnglish: whyMeEnglish,
            whyMeRegional: whyMeRegional,
            matchedPoints: matchedPoints,
            pendingPoints: pendingPoints
        )
    }

    public static func evaluateAll(profile: CitizenProfile?, schemes: [Scheme]) -> [EligibilityResult] {
        let applicableSchemes: [Scheme]
        if let profile = profile, profile.state != "ALL" && !profile.state.isEmpty {
            applicableSchemes = schemes.filter {
                $0.stateId == "ALL" || $0.stateId.caseInsensitiveCompare(profile.state) == .orderedSame
            }
        } else {
            applicableSchemes = schemes
        }

        return applicableSchemes
            .map { evaluate(profile: profile, scheme: $0) }
            .sorted { $0.score > $1.score }
    }
}
