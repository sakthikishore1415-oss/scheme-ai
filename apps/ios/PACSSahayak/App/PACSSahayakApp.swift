import SwiftUI

@main
struct PACSSahayakApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var translationManager = TranslationManager.shared

    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environmentObject(appState)
                .environmentObject(translationManager)
        }
    }
}
