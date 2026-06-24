import SwiftUI

/// Top-level router: splash while loading, then auth or home depending on the
/// Supabase session.
struct RootView: View {
    @EnvironmentObject var session: SessionStore

    var body: some View {
        Group {
            if session.isLoading {
                SplashView()
            } else if session.isAuthenticated {
                HomeView()
            } else {
                AuthView()
            }
        }
        .task {
            await session.bootstrap()
        }
    }
}
