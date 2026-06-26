import SwiftUI

/// Top-level router: splash while loading, then auth or the main tab bar
/// depending on the Supabase session.
struct RootView: View {
    @EnvironmentObject var session: SessionStore

    var body: some View {
        Group {
            if session.isLoading {
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
