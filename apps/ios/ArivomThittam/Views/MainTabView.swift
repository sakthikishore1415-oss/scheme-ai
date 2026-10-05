import SwiftUI

public struct MainTabView: View {
    @ObservedObject var translationManager = TranslationManager.shared
    @EnvironmentObject var appState: AppState

    public init() {}

    public var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label(translationManager.localized("tab_schemes"), systemImage: "square.grid.2x2.fill")
                }

            EligibilityWizardView()
                .tabItem {
                    Label(translationManager.localized("tab_eligibility"), systemImage: "checkmark.seal.fill")
                }

            VoiceAssistantView()
                .tabItem {
                    Label(translationManager.localized("tab_voice"), systemImage: "mic.fill")
                }

            SavedSchemesView()
                .tabItem {
                    Label(translationManager.localized("tab_profile"), systemImage: "bookmark.fill")
                }
        }
        .accentColor(Color.accentColor)
    }
}

public struct SavedSchemesView: View {
    @EnvironmentObject var appState: AppState
    @ObservedObject var translationManager = TranslationManager.shared

    public init() {}

    public var savedSchemes: [Scheme] {
        DefaultSchemes.all.filter { appState.isBookmarked(schemeId: $0.id) }
    }

    public var body: some View {
        NavigationView {
            Group {
                if savedSchemes.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "bookmark.slash")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("No Saved Schemes Yet")
                            .font(.system(size: 18, weight: .bold))
                        Text("Tap the bookmark icon on any scheme detail page to keep track of schemes you wish to apply for.")
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                } else {
                    List {
                        ForEach(savedSchemes) { scheme in
                            let result = appState.eligibilityResults.first { $0.scheme.id == scheme.id }
                            NavigationLink(destination: SchemeDetailView(scheme: scheme, eligibilityResult: result)) {
                                SchemeCardView(scheme: scheme, eligibilityResult: result)
                            }
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                            .listRowSeparator(.hidden)
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Saved Schemes")
        }
    }
}
