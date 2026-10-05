import SwiftUI

public struct StatusBadgeView: View {
    public let status: EligibilityStatus

    public init(status: EligibilityStatus) {
        self.status = status
    }

    public var body: some View {
        HStack(spacing: 4) {
            Image(systemName: iconName)
                .font(.system(size: 11, weight: .semibold))
            Text(status.titleEnglish)
                .font(.system(size: 12, weight: .semibold))
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(backgroundColor)
        .foregroundColor(textColor)
        .cornerRadius(12)
    }

    private var iconName: String {
        switch status {
        case .eligible: return "checkmark.seal.fill"
        case .notEligible: return "xmark.octagon.fill"
        case .needsInformation: return "exclamationmark.triangle.fill"
        case .noData: return "info.circle.fill"
        }
    }

    private var backgroundColor: Color {
        switch status {
        case .eligible: return Color.green.opacity(0.15)
        case .notEligible: return Color.red.opacity(0.15)
        case .needsInformation: return Color.orange.opacity(0.15)
        case .noData: return Color.blue.opacity(0.15)
        }
    }

    private var textColor: Color {
        switch status {
        case .eligible: return Color.green
        case .notEligible: return Color.red
        case .needsInformation: return Color.orange
        case .noData: return Color.blue
        }
    }
}

public struct MatchLevelBadgeView: View {
    public let level: MatchLevel
    public let score: Int

    public init(level: MatchLevel, score: Int) {
        self.level = level
        self.score = score
    }

    public var body: some View {
        HStack(spacing: 5) {
            Text("\(score)%")
                .font(.system(size: 11, weight: .bold))
            Text(level.badgeLabel)
                .font(.system(size: 11, weight: .medium))
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(levelColor.opacity(0.15))
        .foregroundColor(levelColor)
        .cornerRadius(8)
    }

    private var levelColor: Color {
        switch level {
        case .strong: return .green
        case .potential: return .blue
        case .moreInfo: return .orange
        case .ineligible: return .red
        }
    }
}
