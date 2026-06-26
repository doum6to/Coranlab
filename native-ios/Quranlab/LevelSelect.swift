import SwiftUI

// Faithful to the web list page (app/(main)/learn/list/[listId]): after tapping
// a list in "Apprendre", the user picks a level here before the lesson starts.
struct LevelSelectView: View {
    @Environment(\.dismiss) private var dismiss
    let target: ReviewTarget
    let session: SessionStore
    var onRefresh: () -> Void

    @State private var lessonToPlay: PlayLevel?
    private struct PlayLevel: Identifiable { let id: Int }

    private var list: LearnList { target.list }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    header
                    VStack(spacing: 0) {
                        ForEach(Array(list.levels.enumerated()), id: \.element.id) { idx, level in
                            levelRow(level, number: idx + 1)
                            if idx < list.levels.count - 1 { Divider().background(Theme.border) }
                        }
                    }
                    .padding(.horizontal, 4)
                }
                .padding(20)
                .frame(maxWidth: 560)
                .frame(maxWidth: .infinity)
            }
            .background(Color.white.ignoresSafeArea())
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { dismiss() } label: {
                        Label("Retour", systemImage: "chevron.left").foregroundColor(Theme.muted)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
        }
        .fullScreenCover(item: $lessonToPlay) { p in
            LessonView(lessonId: p.id, session: session) { onRefresh() }
        }
    }

    private var header: some View {
        VStack(spacing: 8) {
            Image(ListImages.asset(for: list.listTitle))
                .resizable().scaledToFit().frame(width: 110, height: 110).blendMode(.multiply)
            Text(target.unitTitle.uppercased())
                .font(.system(size: 11, weight: .semibold)).tracking(0.5).foregroundColor(Theme.muted)
            Text(list.listTitle)
                .font(.system(size: 26, weight: .bold)).foregroundColor(Theme.text)
                .multilineTextAlignment(.center).headingStyle()
            HStack(spacing: 6) {
                Image(systemName: "square.stack.3d.up.fill").font(.system(size: 13)).foregroundColor(Theme.muted)
                Text("\(list.totalLevels) Niveaux").font(.system(size: 14)).foregroundColor(Theme.muted)
            }
        }
        .padding(.top, 8)
    }

    private func levelRow(_ level: LearnLevel, number: Int) -> some View {
        Button { lessonToPlay = PlayLevel(id: level.id) } label: {
            HStack(spacing: 16) {
                ZStack {
                    Circle().fill(level.completed ? Theme.green.opacity(0.15) : Theme.surface)
                        .frame(width: 54, height: 54)
                    Image(systemName: level.completed ? "checkmark" : "play.fill")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(level.completed ? Theme.green : Theme.muted)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text("Niveau \(number)").font(.system(size: 16, weight: .bold)).foregroundColor(Theme.text)
                    Text("\(level.completedChallengeCount)/\(level.challengeCount) exercices")
                        .font(.system(size: 13)).foregroundColor(Theme.muted)
                    if level.completed {
                        Text("Complété ✓").font(.system(size: 13, weight: .semibold)).foregroundColor(Theme.green)
                    }
                }
                Spacer()
            }
            .padding(.vertical, 14)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
