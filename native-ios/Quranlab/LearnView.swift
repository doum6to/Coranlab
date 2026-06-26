import SwiftUI

// "Apprendre" tab — the web Learn page: white feed, unit banners and horizontal
// carousels of list cards. Navigation chrome lives in MainTabView.
struct LearnView: View {
    @ObservedObject var store: LearnStore
    var onPlay: (LearnList) -> Void
    var onPremium: () -> Void
    var onGoLecons: () -> Void

    var body: some View {
        LearnFeed(store: store,
                  title: "Apprendre",
                  showReviser: true,
                  onReviser: onGoLecons,
                  onPlay: onPlay,
                  onPremium: onPremium)
    }
}

// "Leçons" tab — same data, review-oriented (no progress emphasis on web; here
// we reuse the faithful feed without the "Réviser" shortcut).
struct LeconsView: View {
    @ObservedObject var store: LearnStore
    var onPlay: (LearnList) -> Void
    var onPremium: () -> Void

    var body: some View {
        LearnFeed(store: store,
                  title: "Leçons",
                  showReviser: false,
                  onPlay: onPlay,
                  onPremium: onPremium)
    }
}
