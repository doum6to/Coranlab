import SwiftUI
import RevenueCat

/// Entry point of the native SwiftUI Quranlab app.
/// Phases 1-4: Supabase auth, learn home, lessons, RevenueCat paywall — all on
/// the existing backend.
@main
struct QuranlabApp: App {
    @StateObject private var session = SessionStore()

    init() {
        // RevenueCat — public iOS SDK key. Safe to embed in the client.
        Purchases.logLevel = .warn
        Purchases.configure(withAPIKey: "appl_iVpZxHlZlyDKPXNhhTusaAbrdtk")
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(session)
        }
    }
}
