import SwiftUI

public struct SchemeDetailView: View {
    public let scheme: Scheme
    public let eligibilityResult: EligibilityResult?

    @Environment(\.presentationMode) var presentationMode
    @EnvironmentObject var appState: AppState

    public init(scheme: Scheme, eligibilityResult: EligibilityResult? = nil) {
        self.scheme = scheme
        self.eligibilityResult = eligibilityResult
    }

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header Authority & Department
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(scheme.authority)
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)
                        Spacer()
                        Button(action: {
                            appState.toggleBookmark(schemeId: scheme.id)
                        }) {
                            Image(systemName: appState.isBookmarked(schemeId: scheme.id) ? "bookmark.fill" : "bookmark")
                                .foregroundColor(.accentColor)
                                .font(.system(size: 18))
                        }
                    }

                    let isRegional = TranslationManager.shared.currentLanguage != .english
                    let cleanNative: String = {
                        guard let raw = scheme.nativeName, !raw.isEmpty else { return "" }
                        let parts = raw.components(separatedBy: "/").map { $0.trimmingCharacters(in: .whitespaces) }
                        return parts.first ?? raw
                    }()
                    let primaryTitle = (isRegional && !cleanNative.isEmpty) ? cleanNative : scheme.name
                    let secondaryTitle = (isRegional && !cleanNative.isEmpty) ? scheme.name : cleanNative

                    Text(primaryTitle)
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.primary)

                    if !secondaryTitle.isEmpty {
                        Text(secondaryTitle)
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.accentColor)
                    }
                }

                // Eligibility Status Card if evaluated
                if let result = eligibilityResult {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            StatusBadgeView(status: result.status)
                            Text("Eligibility Match: \(result.score)%")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        MatchLevelBadgeView(level: result.matchLevel, score: result.score)
                    }
                    .padding(14)
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(12)

                    if !result.whyMeEnglish.isEmpty {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Why You Qualify")
                                .font(.system(size: 15, weight: .bold))
                            ForEach(result.whyMeEnglish, id: \.self) { reason in
                                Text(reason)
                                    .font(.system(size: 13))
                                    .foregroundColor(.green)
                            }
                        }
                        .padding(14)
                        .background(Color.green.opacity(0.08))
                        .cornerRadius(12)
                    }

                    if !result.pendingPoints.isEmpty {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Pending Verification")
                                .font(.system(size: 15, weight: .bold))
                            ForEach(result.pendingPoints, id: \.self) { point in
                                HStack(alignment: .top, spacing: 6) {
                                    Image(systemName: "exclamationmark.circle.fill")
                                        .foregroundColor(.orange)
                                        .font(.system(size: 12))
                                        .padding(.top, 2)
                                    Text(point)
                                        .font(.system(size: 13))
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        .padding(14)
                        .background(Color.orange.opacity(0.08))
                        .cornerRadius(12)
                    }
                }

                // Benefits Section
                VStack(alignment: .leading, spacing: 10) {
                    Text("Benefits & Entitlements")
                        .font(.system(size: 18, weight: .bold))

                    VStack(alignment: .leading, spacing: 8) {
                        if let amount = scheme.benefits.amount {
                            HStack {
                                Text("Amount:")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.secondary)
                                Text(amount)
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(.green)
                            }
                        }

                        if let freq = scheme.benefits.frequency {
                            HStack {
                                Text("Disbursement:")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.secondary)
                                Text(freq)
                                    .font(.system(size: 14))
                                    .foregroundColor(.primary)
                            }
                        }

                        Text(scheme.benefits.detailedBenefit)
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                            .padding(.top, 4)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(12)
                }

                // Document Checklist
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("Required Documents")
                            .font(.system(size: 18, weight: .bold))
                        Spacer()
                        Text("\(scheme.documents.count) Documents")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)
                    }

                    VStack(spacing: 8) {
                        ForEach(scheme.documents) { doc in
                            DocumentChecklistRow(doc: doc)
                        }
                    }
                }

                // Step-by-Step Application Roadmap
                VStack(alignment: .leading, spacing: 10) {
                    Text("How to Apply")
                        .font(.system(size: 18, weight: .bold))

                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(Array(scheme.applicationSteps.enumerated()), id: \.offset) { index, step in
                            HStack(alignment: .top, spacing: 12) {
                                Text("\(index + 1)")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.white)
                                    .frame(width: 24, height: 24)
                                    .background(Color.accentColor)
                                    .clipShape(Circle())

                                Text(step)
                                    .font(.system(size: 14))
                                    .foregroundColor(.primary)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(12)
                }

                // Offline Center Info
                if let center = scheme.offlineApplicationCenter {
                    HStack(spacing: 12) {
                        Image(systemName: "building.2.fill")
                            .foregroundColor(.accentColor)
                            .font(.system(size: 20))
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Offline Application Desk")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.secondary)
                            Text(center)
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.primary)
                        }
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.accentColor.opacity(0.08))
                    .cornerRadius(12)
                }

                // Official Apply Button
                if let urlString = scheme.applicationUrl, let url = URL(string: urlString) {
                    Link(destination: url) {
                        HStack(spacing: 8) {
                            Image(systemName: "safari.fill")
                            Text("Apply on Official Portal")
                                .font(.system(size: 16, weight: .bold))
                            Image(systemName: "arrow.up.right")
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.accentColor)
                        .cornerRadius(12)
                        .shadow(color: Color.accentColor.opacity(0.3), radius: 6, x: 0, y: 3)
                    }
                }

                // Official Verification Tag
                HStack {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundColor(.green)
                    Text("Verified by Government Official Source")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                    if let date = scheme.lastVerified {
                        Text("• \(date)")
                            .font(.system(size: 12))
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.top, 8)
                .frame(maxWidth: .infinity, alignment: .center)
            }
            .padding(20)
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}
