import SwiftUI

// "Apprendre" tab — the web Learn page: white feed, unit banners and horizontal
// carousels of list cards. Navigation chrome lives in MainTabView.
struct LearnView: View {
    @ObservedObject var store: LearnStore
    let session: SessionStore
    var onPremium: () -> Void
    var onGoLecons: () -> Void
    @State private var selected: ReviewTarget?

    var body: some View {
        LearnFeed(store: store,
                  title: "Apprendre",
                  showReviser: true,
                  onReviser: onGoLecons,
                  onPlay: { list in
                      let unit = store.units.first { $0.lists.contains { $0.listId == list.listId } }
                      selected = ReviewTarget(id: list.listId, list: list, unitTitle: unit?.title ?? "")
                  },
                  onPremium: onPremium)
            .fullScreenCover(item: $selected) { t in
                LevelSelectView(target: t, session: session, isPro: store.isPro,
                                onRefresh: { Task { await store.refresh() } })
            }
    }
}

// "Leçons" tab — same data, review-oriented (no progress emphasis on web; here
// we reuse the faithful feed without the "Réviser" shortcut).
struct LeconsView: View {
    @ObservedObject var store: LearnStore
    let session: SessionStore
    var onPremium: () -> Void
    @State private var reviewTarget: ReviewTarget?

    var body: some View {
        LearnFeed(store: store,
                  title: "Leçons",
                  showReviser: false,
                  lecons: true,
                  onPlay: { list in
                      let unit = store.units.first { $0.lists.contains(where: { $0.listId == list.listId }) }
                      reviewTarget = ReviewTarget(id: list.listId, list: list, unitTitle: unit?.title ?? "")
                  },
                  onPremium: onPremium)
            .fullScreenCover(item: $reviewTarget) { t in
                LeconsReviewView(target: t, session: session)
            }
    }
}
