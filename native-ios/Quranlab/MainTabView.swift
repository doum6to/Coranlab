import SwiftUI

// Web-style bottom navigation (sidebar.tsx items adapted to an iOS tab bar):
// Apprendre · Leçons · Classement · Quêtes · Réglages.
struct MainTabView: View {
    @EnvironmentObject var session: SessionStore
    @StateObject private var learn: LearnStore
    @State private var lessonToPlay: PlayLesson?
    @State private var showPaywall = false
    @State private var selection = 0

    private struct PlayLesson: Identifiable { let id: Int }

    init(session: SessionStore) {
        _learn = StateObject(wrappedValue: LearnStore(session: session))
    }

    private func play(_ list: LearnList) {
        if let id = list.activeLevelId ?? list.levels.first?.id {
            lessonToPlay = PlayLesson(id: id)
        }
    }

    var body: some View {
        TabView(selection: $selection) {
            LearnView(store: learn, onPlay: play,
                      onPremium: { showPaywall = true },
                      onGoLecons: { selection = 1 })
                .tag(0)
                .tabItem { tab("learn", "Apprendre") }

            LeconsView(store: learn, onPlay: play,
                       onPremium: { showPaywall = true })
                .tag(1)
                .tabItem { tab("lecons", "Leçons") }

            LeaderboardView()
                .tag(2)
                .tabItem { tab("leaderboard", "Classement") }

            QuestsView(store: learn)
                .tag(3)
                .tabItem { tab("quests", "Quêtes") }

            SettingsScreen()
                .environmentObject(session)
                .tag(4)
                .tabItem { Label("Réglages", systemImage: "gearshape.fill") }
        }
        .tint(Theme.green)
        .sheet(isPresented: $showPaywall) {
            PaywallView { Task { await learn.refresh() } }
        }
        .fullScreenCover(item: $lessonToPlay) { play in
            LessonView(lessonId: play.id, session: session) {
                Task { await learn.refresh() }
            }
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
