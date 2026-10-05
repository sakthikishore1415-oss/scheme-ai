import Foundation
import Combine
import SwiftUI

@MainActor
public class EligibilityViewModel: ObservableObject {
    @Published public var profile: CitizenProfile
    @Published public var results: [EligibilityResult] = []
    @Published public var isEvaluating: Bool = false
    @Published public var currentStep: Int = 1
    @Published public var selectedFilter: String = "ALL" // "ALL", "ELIGIBLE", "POTENTIAL"

    private let repository: SchemeRepository

    public init(profile: CitizenProfile = CitizenProfile(), repository: SchemeRepository = LocalSchemeRepository()) {
        self.profile = profile
        self.repository = repository
    }

    public func evaluateSchemes() async {
        isEvaluating = true
        let response = await repository.getSchemes()
        isEvaluating = false

        if response.status == .success {
            self.results = DeterministicEligibilityEngine.evaluateAll(
                profile: profile,
                schemes: response.schemes
            )
        } else {
            self.results = []
        }
    }

    public var filteredResults: [EligibilityResult] {
        switch selectedFilter {
        case "ELIGIBLE":
            return results.filter { $0.status == .eligible }
        case "STRONG":
            return results.filter { $0.matchLevel == .strong }
        case "POTENTIAL":
            return results.filter { $0.matchLevel == .potential }
        default:
            return results
        }
    }

    public var eligibleCount: Int {
        results.filter { $0.status == .eligible }.count
    }

    public var totalBenefitsPotential: String {
        // Estimation calculation from matched schemes
        let hasPMAY = results.contains { $0.scheme.id == "pm-awas-gramin" && $0.status == .eligible }
        let hasPMKisan = results.contains { $0.scheme.id == "pm-kisan" && $0.status == .eligible }
        let hasMagalir = results.contains { $0.scheme.id == "tn-magalir-urimai" && $0.status == .eligible }

        var total = 0
        if hasPMAY { total += 120000 }
        if hasPMKisan { total += 6000 }
        if hasMagalir { total += 12000 }

        if total > 0 {
            return "₹\(total.formatted())+"
        } else {
            return "Eligible Benefits"
        }
    }
}
