import SwiftUI

public struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @EnvironmentObject var appState: AppState
    @ObservedObject var translationManager = TranslationManager.shared

    @State private var showingEligibilityWizard = false

    public init() {}

    public var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header Brand & Language Switcher
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(translationManager.localized("app_title"))
                                .font(.system(size: 24, weight: .black))
                                .foregroundColor(.primary)
                            Text(translationManager.localized("tagline"))
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.secondary)
                        }

                        Spacer()

                        Button(action: {
                            translationManager.toggleLanguage()
                        }) {
                            HStack(spacing: 4) {
                                Image(systemName: "globe")
                                Text(translationManager.currentLanguage == .english ? "தமிழ்" : "English")
                                    .font(.system(size: 13, weight: .bold))
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.accentColor.opacity(0.12))
                            .foregroundColor(.accentColor)
                            .cornerRadius(20)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)

                    // Search Field
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.secondary)
                        TextField(translationManager.localized("search_placeholder"), text: $viewModel.searchQuery)
                            .font(.system(size: 15))
                        if !viewModel.searchQuery.isEmpty {
                            Button(action: { viewModel.searchQuery = "" }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .padding(12)
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(12)
                    .padding(.horizontal, 16)

                    // Quick Eligibility Banner Card
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(translationManager.localized("check_eligibility_button"))
                                    .font(.system(size: 17, weight: .bold))
                                    .foregroundColor(.white)
                                Text(translationManager.localized("check_eligibility_desc"))
                                    .font(.system(size: 12))
                                    .foregroundColor(.white.opacity(0.9))
                            }
                            Spacer()
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 32))
                                .foregroundColor(.white.opacity(0.85))
                        }

                        Button(action: {
                            showingEligibilityWizard = true
                        }) {
                            Text("Start Instant Assessment →")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.accentColor)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(Color.white)
                                .cornerRadius(8)
                        }
                        .padding(.top, 4)
                    }
                    .padding(16)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: [Color.accentColor, Color.purple.opacity(0.8)]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .cornerRadius(16)
                    .padding(.horizontal, 16)
                    .shadow(color: Color.accentColor.opacity(0.25), radius: 8, x: 0, y: 4)

                    // Category Filter Scroll
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(viewModel.categories, id: \.id) { cat in
                                CategoryChipView(
                                    title: translationManager.currentLanguage == .english ? cat.nameEn : cat.nameTa,
                                    icon: cat.icon,
                                    isSelected: viewModel.selectedCategory == cat.id,
                                    action: { viewModel.selectedCategory = cat.id }
                                )
                            }
                        }
                        .padding(.horizontal, 16)
                    }

                    // Scheme Count Indicator
                    HStack {
                        Text("\(viewModel.filteredSchemes.count) Schemes Available")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.secondary)
                        Spacer()
                    }
                    .padding(.horizontal, 16)

                    // Schemes List
                    LazyVStack(spacing: 14) {
                        ForEach(viewModel.filteredSchemes) { scheme in
                            let result = appState.eligibilityResults.first { $0.scheme.id == scheme.id }
                            NavigationLink(destination: SchemeDetailView(scheme: scheme, eligibilityResult: result)) {
                                SchemeCardView(scheme: scheme, eligibilityResult: result)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .padding(.horizontal, 16)
                }
                .padding(.bottom, 24)
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showingEligibilityWizard) {
                EligibilityWizardView()
            }
            .task {
                await viewModel.loadSchemes()
                appState.recalculateEligibility(with: viewModel.schemes)
            }
        }
    }
}
