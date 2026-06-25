import SwiftUI

/// Native "Apprendre" home — faithful to the web: each unit shows a banner
/// (title + description) and a horizontal carousel of list cards with progress
/// and Premium locks. Data comes from /api/native/learn with a local cache.
struct LearnView: View {
    @EnvironmentObject private var session: SessionStore
    @StateObject private var store: LearnStore
    @State private var lessonToPlay: PlayLesson?
    @State private var showPaywall = false

    private struct PlayLesson: Identifiable { let id: Int }

    init(session: SessionStore) {
        _store = StateObject(wrappedValue: LearnStore(session: session))
    }

    private func handleTap(_ list: LearnList) {
        if list.isPremiumLocked {
            showPaywall = true
        } else if let id = list.activeLevelId ?? list.levels.first?.id {
            lessonToPlay = PlayLesson(id: id)
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if store.units.isEmpty {
                    emptyOrLoading
                } else {
                    content
                }
            }
            .background(Color.white.ignoresSafeArea())
            .navigationTitle("Apprendre")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    if !store.isPro {
                        Button { showPaywall = true } label: {
                            Label("Premium", systemImage: "crown.fill")
                                .labelStyle(.titleAndIcon)
                                .font(.subheadline.bold())
                        }
                        .tint(Theme.primary)
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(role: .destructive) {
                            Task { await session.signOut() }
                        } label: {
                            Label("Se déconnecter", systemImage: "rectangle.portrait.and.arrow.right")
                        }
                    } label: {
                        Image(systemName: "person.crop.circle")
                            .foregroundColor(Theme.primary)
                    }
                }
            }
            .refreshable { await store.refresh() }
            .task { await store.loadCacheThenRefresh() }
            .sheet(isPresented: $showPaywall) {
                PaywallView { Task { await store.refresh() } }
            }
            .fullScreenCover(item: $lessonToPlay) { play in
                LessonView(lessonId: play.id, session: session) {
                    Task { await store.refresh() }
                }
            }
        }
        .tint(Theme.primary)
    }

    // MARK: - States

    @ViewBuilder
    private var emptyOrLoading: some View {
        VStack(spacing: 16) {
            if store.isLoading {
                ProgressView().tint(Theme.primary)
                Text("Chargement…").foregroundColor(Theme.muted)
            } else {
                Image(systemName: "wifi.exclamationmark")
                    .font(.system(size: 40))
                    .foregroundColor(Theme.muted)
                Text(store.errorMessage ?? "Aucun contenu.")
                    .foregroundColor(Theme.muted)
                    .multilineTextAlignment(.center)
                Button("Réessayer") { Task { await store.refresh() } }
                    .foregroundColor(Theme.primary)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var content: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 28) {
                ForEach(store.units) { unit in
                    VStack(alignment: .leading, spacing: 12) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(unit.title)
                                .font(.title3.bold())
                                .foregroundColor(Theme.text)
                            if !unit.description.isEmpty {
                                Text(unit.description)
                                    .font(.subheadline)
                                    .foregroundColor(Theme.muted)
                            }
                        }
                        .padding(.horizontal, 16)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(unit.lists) { list in
                                    ListCardView(list: list) { handleTap(list) }
                                }
                            }
                            .padding(.horizontal, 16)
                        }
                    }
                }
            }
            .padding(.vertical, 16)
        }
    }
}

/// A single list card — mirrors the web ListCard.
private struct ListCardView: View {
    let list: LearnList
    let onTap: () -> Void

    private var ctaLabel: String {
        if list.isPremiumLocked { return "Premium" }
        if list.isCompleted { return "Réviser" }
        return list.completedLevels > 0 ? "Continuer" : "Commencer"
    }

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 12) {
                if list.isPremiumLocked {
                    HStack(spacing: 4) {
                        Image(systemName: "lock.fill").font(.caption2)
                        Text("Premium").font(.caption2.bold())
                    }
                    .foregroundColor(Theme.primary)
                }

                Text(list.listTitle)
                    .font(.subheadline.bold())
                    .foregroundColor(list.isPremiumLocked ? Theme.muted : Theme.text)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .frame(height: 40)

                // Illustration placeholder (per-list images come in a later phase).
                ZStack {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Theme.brandGradient)
                        .opacity(list.isPremiumLocked ? 0.35 : 1)
                    Image(systemName: list.isPremiumLocked ? "lock.fill" : "book.fill")
                        .font(.system(size: 34))
                        .foregroundColor(.white)
                }
                .frame(height: 110)

                if !list.isPremiumLocked {
                    Text(list.isCompleted ? "Terminé" : "Niveau \(list.completedLevels + 1)")
                        .font(.caption.weight(.semibold))
                        .foregroundColor(Theme.primary)
                    ProgressView(value: list.progress)
                        .tint(Theme.primary)
                }

                Text(ctaLabel)
                    .font(.subheadline.bold())
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(list.isPremiumLocked ? Theme.dark : Theme.primary)
                    .cornerRadius(12)
            }
            .padding(14)
            .frame(width: 200)
            .background(Color.white)
            .overlay(RoundedRectangle(cornerRadius: 18).stroke(Theme.border, lineWidth: 2))
            .cornerRadius(18)
            .shadow(color: Color.black.opacity(0.05), radius: 6, y: 3)
        }
        .buttonStyle(.plain)
    }
}
