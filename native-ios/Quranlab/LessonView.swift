import SwiftUI

// Native lesson player — faithful to the web lesson flow:
// header (X + rounded progress bar), an Arabic prompt, a 2-column grid of
// option cards (selected / correct / wrong states use the exact web hex),
// and a footer that switches between "Vérifier" and a colored result panel.
struct LessonView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var store: LessonStore
    let onFinish: () -> Void
    @State private var recallRevealed = false

    init(lessonId: Int, session: SessionStore, onFinish: @escaping () -> Void) {
        _store = StateObject(wrappedValue: LessonStore(lessonId: lessonId, session: session))
        self.onFinish = onFinish
    }

    var body: some View {
        ZStack {
            Color.white.ignoresSafeArea()
            if store.isLoading {
                ProgressView().tint(Theme.green)
            } else if store.finished {
                finishedView
            } else if let challenge = store.current {
                quiz(challenge)
            } else {
                errorView
            }
        }
        .task { await store.load() }
        .onChange(of: store.index) { _ in recallRevealed = false }
    }

    // MARK: - Quiz (routes by exercise type)
    private func quiz(_ challenge: NativeChallenge) -> some View {
        VStack(spacing: 0) {
            header
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    switch challenge.kind {
                    case .matching:
                        promptText(challenge)
                        MatchingView(store: store, challenge: challenge)
                    case .flashcard:
                        FlashcardView(store: store, challenge: challenge)
                    case .anagram:
                        AnagramView(store: store, challenge: challenge)
                    case .flashRecall:
                        promptText(challenge)
                        if recallRevealed {
                            optionGrid(challenge)
                        } else {
                            FlashRecallMemorize(arabic: challenge.arabicWord ?? "") {
                                recallRevealed = true
                            }
                        }
                    case .mc:
                        promptText(challenge)
                        promptView(challenge)
                        optionGrid(challenge)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
                .frame(maxWidth: 560)
                .frame(maxWidth: .infinity)
            }
            if challenge.kind == .mc || challenge.kind == .flashRecall {
                footer(challenge)
            }
        }
    }

    @ViewBuilder
    private func promptText(_ c: NativeChallenge) -> some View {
        if !c.question.isEmpty {
            Text(c.question)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(Theme.text)
                .frame(maxWidth: .infinity, alignment: .leading)
                .headingStyle()
        }
    }

    private var header: some View {
        HStack(spacing: 14) {
            Button { dismiss() } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(Theme.muted)
            }
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(Theme.border)
                    Capsule().fill(Theme.green)
                        .frame(width: max(0, g.size.width * store.progress))
                        .animation(.easeOut(duration: 0.25), value: store.progress)
                }
            }
            .frame(height: 16)
        }
        .padding(.horizontal, 20)
        .padding(.top, 12)
        .padding(.bottom, 8)
    }

    // Arabic (or reversed French) prompt — large, centered.
    @ViewBuilder
    private func promptView(_ c: NativeChallenge) -> some View {
        if let arabic = c.arabicWord, !arabic.isEmpty {
            Text(arabic)
                .font(.system(size: 44, weight: .bold, design: .serif))
                .foregroundColor(Theme.text)
                .environment(\.layoutDirection, .rightToLeft)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 4)
        } else if let fr = c.frenchTranslation, !fr.isEmpty {
            Text(fr)
                .font(.system(size: 26, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 22)
                .background(RoundedRectangle(cornerRadius: Theme.radius).fill(Theme.green))
        }
    }

    private func optionGrid(_ challenge: NativeChallenge) -> some View {
        let cols = challenge.options.count <= 2
            ? [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]
            : [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]
        return LazyVGrid(columns: cols, spacing: 12) {
            ForEach(Array(challenge.options.enumerated()), id: \.element.id) { i, option in
                optionCard(option, number: i + 1)
            }
        }
    }

    private func optionCard(_ option: NativeOption, number: Int) -> some View {
        let isSelected = store.selectedOptionId == option.id
        let revealed = store.status != .idle
        var border = Theme.optionBorder
        var bg = Color.white
        var fg = Theme.text
        var lip = Theme.optionShadow
        if revealed {
            if option.correct { border = Theme.correctBorder; bg = Theme.correctBg; fg = Theme.green; lip = Theme.correctBorder.opacity(0.3) }
            else if isSelected { border = Theme.wrongBorder; bg = Theme.wrongBg; fg = Theme.wrongText; lip = Theme.wrongBorder.opacity(0.4) }
        } else if isSelected {
            border = Theme.green; bg = Theme.selectionBg; fg = Theme.green; lip = Theme.shinyOutlineShadow
        }

        return Button { store.select(option.id) } label: {
            HStack(spacing: 10) {
                ZStack {
                    Circle().stroke(border, lineWidth: 2).frame(width: 22, height: 22)
                    if isSelected || (revealed && option.correct) {
                        Text("\(number)").font(.system(size: 11, weight: .bold)).foregroundColor(fg)
                    } else {
                        Text("\(number)").font(.system(size: 11, weight: .bold)).foregroundColor(Theme.muted)
                    }
                }
                Text(option.label)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(fg)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, 14)
            .frame(maxWidth: .infinity, minHeight: 60)
            .background(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous).fill(bg))
            .overlay(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous).stroke(border, lineWidth: 2))
            .background(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous).fill(lip).offset(y: 4))
        }
        .buttonStyle(.plain)
        .disabled(revealed)
    }

    // MARK: - Footer
    @ViewBuilder
    private func footer(_ challenge: NativeChallenge) -> some View {
        let canCheck = !challenge.isMultipleChoice || store.selectedOptionId != nil
        VStack(spacing: 12) {
            if store.status == .correct {
                resultBanner(icon: "checkmark.circle.fill", tint: Theme.green, title: "Bravo !")
            } else if store.status == .wrong {
                let answer = challenge.options.first { $0.correct }?.label ?? ""
                resultBanner(icon: "xmark.circle.fill", tint: Theme.wrongText,
                             title: "Pas tout à fait", subtitle: answer.isEmpty ? nil : "Réponse : \(answer)")
            }
            ShinyButton(
                title: store.status == .idle ? "Vérifier" : "Suivant",
                variant: store.status == .idle ? (canCheck ? .green : .gray)
                                               : (store.status == .wrong ? .green : .green),
                disabled: store.status == .idle && !canCheck
            ) {
                if store.status == .idle {
                    store.check()
                    if store.status == .correct { Sounds.correct() }
                    else if store.status == .wrong { Sounds.incorrect() }
                } else {
                    Task {
                        await store.advance()
                        if store.finished { Sounds.finish() }
                    }
                }
            }
        }
        .padding(20)
        .background(Color.white.ignoresSafeArea(edges: .bottom))
        .overlay(Rectangle().fill(Theme.border).frame(height: 1), alignment: .top)
    }

    private func resultBanner(icon: String, tint: Color, title: String, subtitle: String? = nil) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 26)).foregroundColor(tint)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.system(size: 15, weight: .bold)).foregroundColor(tint)
                if let s = subtitle {
                    Text(s).font(.system(size: 13, weight: .semibold)).foregroundColor(tint.opacity(0.8))
                }
            }
            Spacer()
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: Theme.radius).fill(tint.opacity(0.10)))
    }

    // MARK: - Finished
    private var finishedView: some View {
        VStack(spacing: 18) {
            Spacer()
            MascotView(size: 120, riv: "completed_lvl")
            Text("Leçon terminée !").font(.system(size: 26, weight: .bold)).foregroundColor(Theme.text).headingStyle()
            Text("\(store.correctCount)/\(store.total) bonnes réponses").foregroundColor(Theme.muted)
            HStack(spacing: 6) {
                Image("points").resizable().scaledToFit().frame(width: 22, height: 22)
                Text("+\(store.total * 10) XP").font(.system(size: 17, weight: .bold)).foregroundColor(Theme.green)
            }
            Spacer()
            ShinyButton(title: "Continuer", variant: .green) { onFinish(); dismiss() }
                .padding(.horizontal, 20).padding(.bottom, 24)
        }
        .padding(.horizontal, 20)
    }

    private var errorView: some View {
        VStack(spacing: 14) {
            Image(systemName: "exclamationmark.triangle").font(.system(size: 40)).foregroundColor(Theme.muted)
            Text(store.errorMessage ?? "Erreur").foregroundColor(Theme.muted)
            Button("Fermer") { dismiss() }.foregroundColor(Theme.green)
        }
        .padding()
    }
}
