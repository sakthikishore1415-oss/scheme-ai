import Foundation

public enum EligibilityStatus: String, Codable, Equatable {
    case eligible = "ELIGIBLE"
    case notEligible = "NOT_ELIGIBLE"
    case needsInformation = "NEEDS_INFORMATION"
    case noData = "NO_DATA"

    public var titleEnglish: String {
        switch self {
        case .eligible: return "Eligible"
        case .notEligible: return "Not Eligible"
        case .needsInformation: return "More Info Needed"
        case .noData: return "Pending Profile"
        }
    }

    public var titleRegional: String {
        switch self {
        case .eligible: return "தகுதியுடையவர்"
        case .notEligible: return "தகுதி பொருந்தவில்லை"
        case .needsInformation: return "கூடுதல் விவரம் தேவை"
        case .noData: return "விவரங்கள் தேவை"
        }
    }
}

public enum MatchLevel: String, Codable, Equatable {
    case strong = "STRONG"
    case potential = "POTENTIAL"
    case moreInfo = "MORE_INFO"
    case ineligible = "INELIGIBLE"

    public var badgeLabel: String {
        switch self {
        case .strong: return "Strong Match"
        case .potential: return "Potential Match"
        case .moreInfo: return "Check Requirements"
        case .ineligible: return "Ineligible"
        }
    }
}

public struct CriteriaBreakdown: Codable, Equatable {
    public let age: Bool
    public let income: Bool
    public let occupation: Bool
    public let location: Bool
    public let gender: Bool
    public let land: Bool

    public init(
        age: Bool,
        income: Bool,
        occupation: Bool,
        location: Bool,
        gender: Bool = true,
        land: Bool = true
    ) {
        self.age = age
        self.income = income
        self.occupation = occupation
        self.location = location
        self.gender = gender
        self.land = land
    }
}

public struct EligibilityResult: Identifiable, Codable, Equatable {
    public var id: String { scheme.id }
    public let scheme: Scheme
    public let score: Int
    public let matchLevel: MatchLevel
    public let status: EligibilityStatus
    public let criteriaBreakdown: CriteriaBreakdown
    public let whyMeEnglish: [String]
    public let whyMeRegional: [String]
    public let matchedPoints: [String]
    public let pendingPoints: [String]

    public init(
        scheme: Scheme,
        score: Int,
        matchLevel: MatchLevel,
        status: EligibilityStatus,
        criteriaBreakdown: CriteriaBreakdown,
        whyMeEnglish: [String],
        whyMeRegional: [String],
        matchedPoints: [String],
        pendingPoints: [String]
    ) {
        self.scheme = scheme
        self.score = score
        self.matchLevel = matchLevel
        self.status = status
        self.criteriaBreakdown = criteriaBreakdown
        self.whyMeEnglish = whyMeEnglish
        self.whyMeRegional = whyMeRegional
        self.matchedPoints = matchedPoints
        self.pendingPoints = pendingPoints
    }
}
