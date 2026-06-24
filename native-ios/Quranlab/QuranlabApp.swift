import SwiftUI

/// Entry point of the native SwiftUI Quranlab app.
/// Phase 1: Supabase auth (login/sign-up) wired to the existing backend.
/// Next phases: the learn home, lessons, and the RevenueCat paywall.
@main
struct QuranlabApp: App {
    @StateObject private var session = SessionStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(session)
        }
    }
}
