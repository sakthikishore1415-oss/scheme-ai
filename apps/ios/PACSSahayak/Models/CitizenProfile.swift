import Foundation

public struct CitizenProfile: Identifiable, Codable, Equatable {
    public var id: String
    public var name: String
    public var age: Int
    public var gender: String // "male", "female", "transgender", "all"
    public var state: String
    public var district: String
    public var occupation: String
    public var annualIncome: Int64
    public var landHoldingAcres: Double?
    public var disability: Bool
    public var community: String? // "SC", "ST", "OBC", "MBC", "GENERAL"
    public var maritalStatus: String? // "single", "married", "widowed", "deserted"
    public var need: String
    public var voiceLanguage: String

    public init(
        id: String = UUID().uuidString,
        name: String = "",
        age: Int = 0,
        gender: String = "all",
        state: String = "TN",
        district: String = "",
        occupation: String = "",
        annualIncome: Int64 = 0,
        landHoldingAcres: Double? = 0.0,
        disability: Bool = false,
        community: String? = nil,
        maritalStatus: String? = nil,
        need: String = "general",
        voiceLanguage: String = "ta"
    ) {
        self.id = id
        self.name = name
        self.age = age
        self.gender = gender
        self.state = state
        self.district = district
        self.occupation = occupation
        self.annualIncome = annualIncome
        self.landHoldingAcres = landHoldingAcres
        self.disability = disability
        self.community = community
        self.maritalStatus = maritalStatus
        self.need = need
        self.voiceLanguage = voiceLanguage
    }
}

public struct FamilyMember: Identifiable, Codable, Equatable {
    public var id: String
    public var name: String
    public var relationship: String
    public var age: Int
    public var occupation: String
    public var gender: String
    public var annualIncome: Int64?

    public init(
        id: String = UUID().uuidString,
        name: String,
        relationship: String,
        age: Int,
        occupation: String,
        gender: String,
        annualIncome: Int64? = nil
    ) {
        self.id = id
        self.name = name
        self.relationship = relationship
        self.age = age
        self.occupation = occupation
        self.gender = gender
        self.annualIncome = annualIncome
    }
}
