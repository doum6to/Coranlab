import SwiftUI

// Web-style bottom navigation (sidebar.tsx items adapted to an iOS tab bar):
// Apprendre · Leçons · Classement · Quêtes · Réglages.
struct MainTabView: View {
    @EnvironmentObject var session: SessionStore
    @StateObject private var learn: LearnStore
    @State private var showPaywall = false
    @StateObject private var books = BooksStore()
    @State private var selection = 0


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

            BooksScreen(store: books, session: session, isPro: learn.isPro, onPremium: { showPaywall = true })
                .tag(2)
                .tabItem { Label("Boutique", systemImage: "books.vertical.fill") }

            PaywallView(onPurchased: { Task { await learn.refresh() } }, showClose: false)
                .tag(3)
                .tabItem { Label("Premium", systemImage: "crown.fill") }

            SettingsScreen(isPro: learn.isPro, streak: learn.streak)
                .environmentObject(session)
                .tag(4)
                .tabItem { tab("nav_settings", "Réglages") }
        }
        .tint(Theme.green)
        .sheet(isPresented: $showPaywall) {
            PaywallView { Task { await learn.refresh() } }
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
