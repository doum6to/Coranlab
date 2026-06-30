import SwiftUI

// Web-style bottom navigation (sidebar.tsx items adapted to an iOS tab bar):
// Apprendre · Leçons · Classement · Quêtes · Réglages.
struct MainTabView: View {
    @EnvironmentObject var session: SessionStore
    @StateObject private var learn: LearnStore
    @State private var showPaywall = false
    @StateObject private var books = BooksStore()
    @State private var selection = 0
    @State private var authMode: AuthView.Mode? = nil


    init(session: SessionStore) {
        _learn = StateObject(wrappedValue: LearnStore(session: session))
    }

    var body: some View {
        TabView(selection: $selection) {
            LearnView(store: learn, session: session,
                      onPremium: { showPaywall = true },
                      onGoLecons: { selection = 1 })
                .tag(0)
                .tabItem { tab("nav_home", "Apprendre") }

            LeconsView(store: learn, session: session,
                       onPremium: { showPaywall = true })
                .tag(1)
                .tabItem { tab("nav_cours", "Leçons") }

            BooksScreen(store: books, session: session, isPro: learn.isPro,
                        onPremium: { showPaywall = true },
                        onRequireAuth: session.isGuest ? { authMode = .signUp } : nil)
                .tag(2)
                .tabItem { Label("Boutique", systemImage: "books.vertical.fill") }

            PaywallView(onPurchased: { Task { await learn.refresh() } }, showClose: false,
                        onRequireAuth: session.isGuest ? { authMode = .signUp } : nil)
                .tag(3)
                .tabItem { Label("Premium", systemImage: "crown.fill") }

            SettingsScreen(isPro: learn.isPro, streak: learn.streak, activeDays: learn.activeDays,
                           onRequireAuth: { authMode = $0 })
                .environmentObject(session)
                .tag(4)
                .tabItem { tab("nav_settings", "Réglages") }
        }
        .tint(Theme.green)
        .task { await NotificationManager.shared.refreshOnLaunch() }
        .sheet(isPresented: $showPaywall) {
            PaywallView(onPurchased: { Task { await learn.refresh() } },
                        onRequireAuth: session.isGuest ? { showPaywall = false; authMode = .signUp } : nil)
        }
        .sheet(item: $authMode) { mode in
            AuthView(mode: mode, onBack: { authMode = nil })
                .environmentObject(session)
        }
        .onChange(of: session.isAuthenticated) { authed in
            if authed { authMode = nil }
        }
    }

    private func tab(_ asset: String, _ label: String) -> some View {
        Label {
            Text(label)
        } icon: {
            Image(asset).renderingMode(.template)
        }
    }
}
