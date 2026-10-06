import Foundation
import Combine
import SwiftUI

@MainActor
public class DashboardViewModel: ObservableObject {
    @Published public var schemes: [Scheme] = []
    @Published public var filteredSchemes: [Scheme] = []
    @Published public var searchQuery: String = "" {
        didSet { applyFilters() }
    }
    @Published public var selectedCategory: String = "all" {
        didSet { applyFilters() }
    }
    @Published public var selectedState: String = "ALL" {
        didSet { applyFilters() }
    }
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String? = nil

    public let categories: [(id: String, nameEn: String, nameTa: String, icon: String)] = [
        ("all", "All", "அனைத்தும்", "square.grid.2x2.fill"),
        ("agriculture", "Agriculture", "விவசாயம்", "leaf.fill"),
        ("housing", "Housing", "வீட்டுவசதி", "house.fill"),
        ("health", "Health", "மருத்துவம்", "cross.case.fill"),
        ("women", "Women", "மகளிர்", "figure.stand.dress"),
        ("education", "Education", "கல்வி", "graduationcap.fill")
    ]

    private let repository: SchemeRepository

    public init(repository: SchemeRepository = LocalSchemeRepository()) {
        self.repository = repository
    }

    public func loadSchemes() async {
        isLoading = true
        errorMessage = nil
        let response = await repository.getSchemes()
        isLoading = false

        switch response.status {
        case .success:
            self.schemes = response.schemes
            self.applyFilters()
        case .noData:
            self.schemes = []
            self.filteredSchemes = []
            self.errorMessage = response.message ?? "No schemes available."
        case .error:
            self.schemes = []
            self.filteredSchemes = []
            self.errorMessage = response.message ?? "Failed to load schemes."
        }
    }

    public func applyFilters() {
        var result = schemes

        if selectedCategory != "all" {
            result = result.filter { $0.category.caseInsensitiveCompare(selectedCategory) == .orderedSame }
        }

        if selectedState != "ALL" {
            result = result.filter {
                $0.stateId == "ALL" || $0.stateId.caseInsensitiveCompare(selectedState) == .orderedSame
            }
        }

        if !searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            let q = searchQuery.lowercased()
            result = result.filter {
                $0.name.lowercased().contains(q) ||
                ($0.nativeName?.lowercased().contains(q) ?? false) ||
                $0.department.lowercased().contains(q) ||
                $0.summarySimple.lowercased().contains(q)
            }
        }

        self.filteredSchemes = result
    }
}
