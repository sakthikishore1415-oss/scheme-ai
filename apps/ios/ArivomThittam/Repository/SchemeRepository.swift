import Foundation

public enum RepositoryStatus: String, Codable {
    case success = "SUCCESS"
    case noData = "NO_DATA"
    case error = "ERROR"
}

public struct SchemeRepositoryResponse {
    public let schemes: [Scheme]
    public let status: RepositoryStatus
    public let totalCount: Int
    public let message: String?

    public init(schemes: [Scheme], status: RepositoryStatus, totalCount: Int, message: String? = nil) {
        self.schemes = schemes
        self.status = status
        self.totalCount = totalCount
        self.message = message
    }
}

public protocol SchemeRepository {
    func getSchemes() async -> SchemeRepositoryResponse
    func getSchemeById(id: String) async -> Scheme?
    func searchSchemes(query: String?, category: String?, state: String?) async -> [Scheme]
}
