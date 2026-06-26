import SwiftUI

// Faithful to the web list page (app/(main)/learn/list/[listId]): after tapping
// a list in "Apprendre", the user picks a level here before the lesson starts.
struct LevelSelectView: View {
    @Environment(\.dismiss) private var dismiss
    let target: ReviewTarget
    let session: SessionStore
    var isPro: Bool = false
    var onRefresh: () -> Void

    @State private var lessonToPlay: PlayLevel?
    private struct PlayLevel: Identifiable { let id: Int }

    private var list: LearnList { target.list }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    header
                    VStack(spacing: 18) {
                        ForEach(Array(list.levels.enumerated()), id: \.element.id) { idx, level in
                            let locked = idx > 0 && !list.levels[idx - 1].completed
                            levelRow(level, number: idx + 1,
                                     locked: locked,
                                     isLast: idx == list.levels.count - 1)
                        }
                    }
                    .padding(.top, 8)
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
            LessonView(lessonId: p.id, session: session, isPro: isPro) { onRefresh() }
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

    private func levelRow(_ level: LearnLevel, number: Int, locked: Bool, isLast: Bool) -> some View {
        let completed = level.completed
        let active = !completed && !locked
        let state = completed ? "done" : (active ? "active" : "locked")
        let asset = "level_\(isLast ? "star" : "disc")_\(state)"
        let pct = level.challengeCount > 0
            ? Int(Double(level.completedChallengeCount) / Double(level.challengeCount) * 100) : 0

        return Button { if !locked { lessonToPlay = PlayLevel(id: level.id) } } label: {
            HStack(spacing: 16) {
                ZStack {
                    Image(asset)
                        .resizable().scaledToFit()
                        .frame(width: 118, height: active ? 116 : 84)
                    if active {
                        // white glow under the mascot
                        Ellipse()
                            .fill(LinearGradient(colors: [.white.opacity(0.9), .white.opacity(0)],
                                                 startPoint: .bottom, endPoint: .top))
                            .frame(width: 58, height: 38).blur(radius: 8)
                            .offset(y: -6)
                        // Koji on top of the active platform
                        MascotView(size: 132).offset(y: -54)
                    }
                }
                .frame(width: 124, height: active ? 124 : 90)

                VStack(alignment: .leading, spacing: 3) {
                    Text("Niveau \(number)")
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(locked ? Theme.muted : Theme.text)
                    Text("\(level.completedChallengeCount)/\(level.challengeCount) exercices")
                        .font(.system(size: 13)).foregroundColor(Theme.muted)
                    if completed {
                        Text("Complété ✓").font(.system(size: 13, weight: .semibold)).foregroundColor(Theme.green)
                    } else if locked {
                        HStack(spacing: 4) {
                            Image(systemName: "lock.fill").font(.system(size: 10))
                            Text("Termine le niveau précédent").font(.system(size: 12))
                        }.foregroundColor(Theme.muted)
                    } else if active && pct > 0 {
                        HStack(spacing: 8) {
                            GeometryReader { g in
                                ZStack(alignment: .leading) {
                                    Capsule().fill(Theme.border)
                                    Capsule().fill(Theme.green).frame(width: g.size.width * CGFloat(pct) / 100)
                                }
                            }.frame(width: 80, height: 5)
                            Text("\(pct)%").font(.system(size: 12, weight: .medium)).foregroundColor(Theme.green)
                        }
                    }
                }
                Spacer(minLength: 0)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(locked)
    }
}
