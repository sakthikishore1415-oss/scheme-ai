import SwiftUI

public struct SchemeCardView: View {
    public let scheme: Scheme
    public let eligibilityResult: EligibilityResult?

    public init(scheme: Scheme, eligibilityResult: EligibilityResult? = nil) {
        self.scheme = scheme
        self.eligibilityResult = eligibilityResult
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header: Category, State badge, and optional match badge
            HStack {
                HStack(spacing: 6) {
                    Text(scheme.category.capitalized)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.accentColor)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color.accentColor.opacity(0.12))
                        .cornerRadius(6)

                    Text(scheme.schemeType == "central" ? "Central" : scheme.stateId)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.secondary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color(UIColor.secondarySystemBackground))
                        .cornerRadius(6)
                }

                Spacer()

                if let result = eligibilityResult {
                    MatchLevelBadgeView(level: result.matchLevel, score: result.score)
                }
            }

            // Scheme Name & Native Name
            VStack(alignment: .leading, spacing: 4) {
                Text(scheme.name)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.primary)
                    .lineLimit(2)

                if let native = scheme.nativeName, !native.isEmpty {
                    Text(native)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }

            // Summary
            Text(scheme.summarySimple)
                .font(.system(size: 13))
                .foregroundColor(.secondary)
                .lineLimit(2)

            // Benefit Footer
            HStack {
                if let amount = scheme.benefits.amount {
                    HStack(spacing: 4) {
                        Image(systemName: "indianrupeesign.circle.fill")
                            .foregroundColor(.green)
                            .font(.system(size: 14))
                        Text(amount)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.green)
                    }
                } else {
                    Text(scheme.benefits.shortSummary)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.accentColor)
                        .lineLimit(1)
                }

                Spacer()

                HStack(spacing: 4) {
                    Text("Details")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.accentColor)
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.accentColor)
                }
            }
            .padding(.top, 4)
        }
        .padding(16)
        .background(Color(UIColor.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: 3)
    }
}
