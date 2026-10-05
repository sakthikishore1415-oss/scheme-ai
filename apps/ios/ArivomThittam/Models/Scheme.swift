import Foundation

public struct DocumentRequirement: Identifiable, Codable, Equatable, Hashable {
    public var id: String { name }
    public let name: String
    public let mandatory: Bool
    public let description: String

    public init(name: String, mandatory: Bool, description: String) {
        self.name = name
        self.mandatory = mandatory
        self.description = description
    }
}

public struct SchemeBenefit: Codable, Equatable, Hashable {
    public let type: String // "direct_cash", "subsidy", "insurance", "pension", "loan", "scholarship", "cash_transfer"
    public let amount: String?
    public let shortSummary: String
    public let detailedBenefit: String
    public let frequency: String?

    public init(
        type: String,
        amount: String? = nil,
        shortSummary: String,
        detailedBenefit: String,
        frequency: String? = nil
    ) {
        self.type = type
        self.amount = amount
        self.shortSummary = shortSummary
        self.detailedBenefit = detailedBenefit
        self.frequency = frequency
    }
}

public struct EligibilityRules: Codable, Equatable, Hashable {
    public let minAge: Int?
    public let maxAge: Int?
    public let genders: [String]?
    public let maxAnnualIncome: Int64?
    public let allowedOccupations: [String]?
    public let requiresDisability: Bool?
    public let requiredCommunities: [String]?
    public let maxLandHoldingAcres: Double?
    public let requiresLandOwnership: Bool?
    public let allowedMaritalStatus: [String]?

    public init(
        minAge: Int? = nil,
        maxAge: Int? = nil,
        genders: [String]? = nil,
        maxAnnualIncome: Int64? = nil,
        allowedOccupations: [String]? = nil,
        requiresDisability: Bool? = nil,
        requiredCommunities: [String]? = nil,
        maxLandHoldingAcres: Double? = nil,
        requiresLandOwnership: Bool? = nil,
        allowedMaritalStatus: [String]? = nil
    ) {
        self.minAge = minAge
        self.maxAge = maxAge
        self.genders = genders
        self.maxAnnualIncome = maxAnnualIncome
        self.allowedOccupations = allowedOccupations
        self.requiresDisability = requiresDisability
        self.requiredCommunities = requiredCommunities
        self.maxLandHoldingAcres = maxLandHoldingAcres
        self.requiresLandOwnership = requiresLandOwnership
        self.allowedMaritalStatus = allowedMaritalStatus
    }
}

public struct LanguageContent: Codable, Equatable, Hashable {
    public let title: String
    public let summary: String
    public let voiceExplanation: String
    public let simpleRoadmap: [String]

    public init(title: String, summary: String, voiceExplanation: String, simpleRoadmap: [String]) {
        self.title = title
        self.summary = summary
        self.voiceExplanation = voiceExplanation
        self.simpleRoadmap = simpleRoadmap
    }
}

public struct Scheme: Identifiable, Codable, Equatable, Hashable {
    public let id: String
    public let name: String
    public let nativeName: String?
    public let authority: String
    public let department: String
    public let stateId: String
    public let schemeType: String // "central" or "state"
    public let category: String
    public let summarySimple: String
    public let benefits: SchemeBenefit
    public let eligibility: EligibilityRules
    public let documents: [DocumentRequirement]
    public let applicationSteps: [String]
    public let offlineApplicationCenter: String?
    public let applicationUrl: String?
    public let officialSource: String
    public let lastVerified: String?
    public let languageContent: [String: LanguageContent]?

    public init(
        id: String,
        name: String,
        nativeName: String? = nil,
        authority: String,
        department: String,
        stateId: String,
        schemeType: String,
        category: String,
        summarySimple: String,
        benefits: SchemeBenefit,
        eligibility: EligibilityRules,
        documents: [DocumentRequirement],
        applicationSteps: [String],
        offlineApplicationCenter: String? = nil,
        applicationUrl: String? = nil,
        officialSource: String,
        lastVerified: String? = nil,
        languageContent: [String: LanguageContent]? = nil
    ) {
        self.id = id
        self.name = name
        self.nativeName = nativeName
        self.authority = authority
        self.department = department
        self.stateId = stateId
        self.schemeType = schemeType
        self.category = category
        self.summarySimple = summarySimple
        self.benefits = benefits
        self.eligibility = eligibility
        self.documents = documents
        self.applicationSteps = applicationSteps
        self.offlineApplicationCenter = offlineApplicationCenter
        self.applicationUrl = applicationUrl
        self.officialSource = officialSource
        self.lastVerified = lastVerified
        self.languageContent = languageContent
    }
}
