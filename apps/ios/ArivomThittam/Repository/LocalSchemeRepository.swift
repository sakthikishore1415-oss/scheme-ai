import Foundation

public class LocalSchemeRepository: SchemeRepository {
    private var schemes: [Scheme]

    public init(initialSchemes: [Scheme] = DefaultSchemes.all) {
        self.schemes = initialSchemes
    }

    public func getSchemes() async -> SchemeRepositoryResponse {
        if schemes.isEmpty {
            return SchemeRepositoryResponse(
                schemes: [],
                status: .noData,
                totalCount: 0,
                message: "No government schemes loaded. Connect to verified government API or database."
            )
        }
        return SchemeRepositoryResponse(
            schemes: schemes,
            status: .success,
            totalCount: schemes.count
        )
    }

    public func getSchemeById(id: String) async -> Scheme? {
        return schemes.first { $0.id == id }
    }

    public func searchSchemes(query: String?, category: String?, state: String?) async -> [Scheme] {
        return schemes.filter { scheme in
            if let state = state, state != "ALL" && !state.isEmpty {
                if scheme.stateId != "ALL" && scheme.stateId.caseInsensitiveCompare(state) != .orderedSame {
                    return false
                }
            }

            if let category = category, category != "all" && !category.isEmpty {
                if scheme.category.caseInsensitiveCompare(category) != .orderedSame {
                    return false
                }
            }

            if let query = query, !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                let q = query.lowercased()
                let matchesName = scheme.name.lowercased().contains(q)
                let matchesNativeName = scheme.nativeName?.lowercased().contains(q) ?? false
                let matchesDept = scheme.department.lowercased().contains(q)
                let matchesSummary = scheme.summarySimple.lowercased().contains(q)
                if !matchesName && !matchesNativeName && !matchesDept && !matchesSummary {
                    return false
                }
            }

            return true
        }
    }
}
