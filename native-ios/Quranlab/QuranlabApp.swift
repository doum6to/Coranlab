import SwiftUI

/// Entry point of the native SwiftUI Quranlab app.
/// Phase 0: a minimal, guaranteed-to-compile shell to validate the
/// code → Codemagic (cloud Mac) → TestFlight pipeline without a Mac.
/// Next phases add Supabase auth, the learn home, lessons, and the
/// RevenueCat paywall — reusing the existing backend.
@main
struct QuranlabApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
