import SwiftUI

/// Top-level router: splash while loading, then auth or the main tab bar
/// depending on the Supabase session.
struct RootView: View {
    @EnvironmentObject var session: SessionStore
    @AppStorage("onboardingDone") private var onboardingDone = false

    var body: some View {
        Group {
            if !onboardingDone {
                OnboardingView { onboardingDone = true }
            } else if session.isLoading {
                SplashView()
            } else if session.isAuthenticated {
                MainTabView(session: session)
            } else {
                AuthView()
            }
        }
        .task { await session.bootstrap() }
    }
}
