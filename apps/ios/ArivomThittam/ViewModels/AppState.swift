import Foundation
import Combine
import SwiftUI

public class AppState: ObservableObject {
    @Published public var citizenProfile: CitizenProfile
    @Published public var bookmarkedSchemeIds: Set<String> = []
    @Published public var eligibilityResults: [EligibilityResult] = []

    public init() {
        self.citizenProfile = CitizenProfile()
    }

    public func toggleBookmark(schemeId: String) {
        if bookmarkedSchemeIds.contains(schemeId) {
            bookmarkedSchemeIds.remove(schemeId)
        } else {
            bookmarkedSchemeIds.insert(schemeId)
        }
    }

    public func isBookmarked(schemeId: String) -> Bool {
        bookmarkedSchemeIds.contains(schemeId)
    }

    public func recalculateEligibility(with schemes: [Scheme]) {
        self.eligibilityResults = DeterministicEligibilityEngine.evaluateAll(
            profile: citizenProfile,
            schemes: schemes
        )
    }
}
