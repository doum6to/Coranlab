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

    // MARK: - Quiz (routes by exercise type; content vertically centered)
    private func quiz(_ challenge: NativeChallenge) -> some View {
        VStack(spacing: 0) {
            header
            GeometryReader { geo in
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        Spacer(minLength: 8)
                        exerciseContent(challenge)
                        Spacer(minLength: 8)
                    }
                    .id(challenge.id)   // fresh state per challenge (fixes matching/bet state bleed)
                    .padding(.horizontal, 20)
                    .frame(maxWidth: 560)
                    .frame(maxWidth: .infinity)
                    .frame(minHeight: geo.size.height)
                }
            }
            if showsFooter(challenge) { footer(challenge) }
        }
    }

    @ViewBuilder
    private func exerciseContent(_ challenge: NativeChallenge) -> some View {
        switch challenge.kind {
        case .matching:
            MatchingView(store: store, challenge: challenge)
        case .flashcard:
            FlashcardView(store: store, challenge: challenge)
        case .anagram:
            AnagramView(store: store, challenge: challenge)
        case .vraiFaux:
            VraiFauxView(store: store, challenge: challenge)
        case .confidenceBet:
            ConfidenceBetView(store: store, challenge: challenge)
        case .spotError:
            SpotTheErrorView(store: store, challenge: challenge)
        case .opposite:
            ArabicBox(text: challenge.arabicWord ?? "")
            Text("Trouve le mot opposé")
                .font(.system(size: 13, weight: .medium)).foregroundColor(Theme.muted)
            answerList(challenge)
        case .flashRecall:
            if recallRevealed {
                answerList(challenge)
            } else {
                FlashRecallMemorize(arabic: challenge.arabicWord ?? "") { recallRevealed = true }
            }
        case .mc:
            promptView(challenge)
            answerList(challenge)
        }
    }

    private func answerList(_ challenge: NativeChallenge) -> some View {
        OptionList(options: challenge.options, selectedId: store.selectedOptionId,
                   revealed: store.status != .idle, onSelect: { store.select($0) })
    }

    private func showsFooter(_ c: NativeChallenge) -> Bool {
        switch c.kind {
        case .matching, .flashcard, .anagram, .spotError: return false
        default: return true
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

    @ViewBuilder
    private func promptView(_ c: NativeChallenge) -> some View {
        if let arabic = c.arabicWord, !arabic.isEmpty {
            ArabicBox(text: arabic)
        } else if let fr = c.frenchTranslation, !fr.isEmpty {
            FrenchPromptBox(text: fr)
        }
    }

    // MARK: - Footer
    @ViewBuilder
    private func footer(_ challenge: NativeChallenge) -> some View {
        let canCheck = store.selectedOptionId != nil
        VStack(spacing: 12) {
            if store.status == .correct {
                resultBanner(icon: "checkmark.circle.fill", tint: Theme.green, title: "Bravo !")
            } else if store.status == .wrong {
                let answer = challenge.options.first { $0.correct }?.label ?? ""
                resultBanner(icon: "xmark.circle.fill", tint: Theme.wrongText,
                             title: "Pas tout à fait", subtitle: answer.isEmpty ? nil : "Réponse : \(answer)")
            }
            HStack {
                Spacer(minLength: 0)
                ShinyButton(
                    title: store.status == .idle ? "Vérifier" : "Suivant",
                    variant: store.status == .idle ? (canCheck ? .green : .gray) : .green,
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
                .frame(maxWidth: 220)
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

    // MARK: - Finished (pass requires >= 90% — web parity)
    private var finishedView: some View {
        let passed = store.passed
        return VStack(spacing: 18) {
            Spacer()
            if passed {
                MascotView(size: 130, riv: "completed_lvl")
                Text("Leçon terminée !").font(.system(size: 26, weight: .bold)).foregroundColor(Theme.text).headingStyle()
                Text("\(store.correctCount)/\(store.totalChoices) bonnes réponses").foregroundColor(Theme.muted)
                HStack(spacing: 6) {
                    Image("points").resizable().scaledToFit().frame(width: 22, height: 22)
                    Text("+\(store.correctCount * 10) XP").font(.system(size: 17, weight: .bold)).foregroundColor(Theme.green)
                }
            } else {
                MascotView(size: 130, riv: "eyes_down")
                Text("Pas encore validé").font(.system(size: 26, weight: .bold)).foregroundColor(Theme.text).headingStyle()
                Text("\(store.correctCount)/\(store.totalChoices) — il faut au moins 90 % de bonnes réponses pour valider.")
                    .foregroundColor(Theme.muted).multilineTextAlignment(.center).padding(.horizontal, 24)
            }
            Spacer()
            if passed {
                ShinyButton(title: "Continuer", variant: .green) { onFinish(); dismiss() }
                    .padding(.horizontal, 20).padding(.bottom, 24)
            } else {
                VStack(spacing: 10) {
                    ShinyButton(title: "Recommencer", variant: .green) {
                        store.reset()
                    }
                    ShinyButton(title: "Quitter", variant: .outlineGreen) { onFinish(); dismiss() }
                }
                .padding(.horizontal, 20).padding(.bottom, 24)
            }
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
