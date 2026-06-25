import SwiftUI

/// Native lesson player — quiz flow faithful to the web (progress header,
/// question, tappable options, check → continue, finished screen).
struct LessonView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var store: LessonStore
    let onFinish: () -> Void

    private let correctColor = Color(hex: 0x58CC02)
    private let wrongColor = Color(hex: 0xEF4444)

    init(lessonId: Int, session: SessionStore, onFinish: @escaping () -> Void) {
        _store = StateObject(wrappedValue: LessonStore(lessonId: lessonId, session: session))
        self.onFinish = onFinish
    }

    var body: some View {
        ZStack {
            Color.white.ignoresSafeArea()
            if store.isLoading {
                ProgressView().tint(Theme.primary)
            } else if store.finished {
                finishedView
            } else if let challenge = store.current {
                quiz(challenge)
            } else {
                errorView
            }
        }
        .task { await store.load() }
    }

    // MARK: - Quiz

    private func quiz(_ challenge: NativeChallenge) -> some View {
        VStack(spacing: 0) {
            header

            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text(challenge.question)
                        .font(.title3.bold())
                        .foregroundColor(Theme.text)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    if let arabic = challenge.arabicWord, !arabic.isEmpty {
                        Text(arabic)
                            .font(.system(size: 40, weight: .bold))
                            .foregroundColor(Theme.text)
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding(.vertical, 8)
                    }

                    if challenge.isMultipleChoice {
                        ForEach(challenge.options) { option in
                            optionRow(option, in: challenge)
                        }
                    } else {
                        simplifiedCard(challenge)
                    }
                }
                .padding(20)
            }

            footer(challenge)
        }
    }

    private var header: some View {
        HStack(spacing: 14) {
            Button { dismiss() } label: {
                Image(systemName: "xmark")
                    .font(.headline)
                    .foregroundColor(Theme.muted)
            }
            ProgressView(value: store.progress)
                .tint(Theme.primary)
        }
        .padding(.horizontal, 20)
        .padding(.top, 12)
    }

    private func optionRow(_ option: NativeOption, in challenge: NativeChallenge) -> some View {
        let isSelected = store.selectedOptionId == option.id
        let revealed = store.status != .idle
        // Colours after the answer is checked.
        var border = Theme.border
        var bg = Color.white
        if revealed {
            if option.correct {
                border = correctColor; bg = correctColor.opacity(0.12)
            } else if isSelected {
                border = wrongColor; bg = wrongColor.opacity(0.12)
            }
        } else if isSelected {
            border = Theme.primary; bg = Theme.primary.opacity(0.08)
        }

        return Button {
            store.select(option.id)
        } label: {
            HStack {
                Text(option.label)
                    .foregroundColor(Theme.text)
                    .multilineTextAlignment(.leading)
                Spacer()
                if revealed && option.correct {
                    Image(systemName: "checkmark.circle.fill").foregroundColor(correctColor)
                } else if revealed && isSelected {
                    Image(systemName: "xmark.circle.fill").foregroundColor(wrongColor)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity)
            .background(bg)
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(border, lineWidth: 2))
            .cornerRadius(14)
        }
        .buttonStyle(.plain)
        .disabled(revealed)
    }

    private func simplifiedCard(_ challenge: NativeChallenge) -> some View {
        VStack(spacing: 12) {
            if let fr = challenge.frenchTranslation, !fr.isEmpty {
                Text(fr).font(.title3).foregroundColor(Theme.text)
            }
            if !challenge.options.isEmpty {
                ForEach(challenge.options.prefix(6)) { o in
                    Text(o.label)
                        .foregroundColor(Theme.muted)
                        .frame(maxWidth: .infinity)
                        .padding(12)
                        .background(Theme.surface)
                        .cornerRadius(10)
                }
            }
        }
        .frame(maxWidth: .infinity)
    }

    private func footer(_ challenge: NativeChallenge) -> some View {
        let canCheck = !challenge.isMultipleChoice || store.selectedOptionId != nil
        let checked = store.status != .idle
        let label = checked ? "Continuer" : "Vérifier"
        let tint: Color = {
            if store.status == .wrong { return wrongColor }
            if store.status == .correct { return correctColor }
            return Theme.primary
        }()

        return VStack {
            Button {
                if checked {
                    Task { await store.advance() }
                } else {
                    store.check()
                }
            } label: {
                Text(label)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(tint)
                    .cornerRadius(14)
            }
            .disabled(!canCheck)
            .opacity(canCheck ? 1 : 0.6)
        }
        .padding(20)
    }

    // MARK: - Finished

    private var finishedView: some View {
        VStack(spacing: 18) {
            Spacer()
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 72))
                .foregroundColor(correctColor)
            Text("Leçon terminée !")
                .font(.title.bold())
                .foregroundColor(Theme.text)
            Text("\(store.correctCount)/\(store.total) bonnes réponses")
                .foregroundColor(Theme.muted)
            Text("+\(store.total * 10) XP")
                .font(.headline)
                .foregroundColor(Theme.primary)
            Spacer()
            Button {
                onFinish()
                dismiss()
            } label: {
                Text("Continuer")
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Theme.primary)
                    .cornerRadius(14)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
        }
        .padding(.horizontal, 20)
    }

    private var errorView: some View {
        VStack(spacing: 14) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 40)).foregroundColor(Theme.muted)
            Text(store.errorMessage ?? "Erreur").foregroundColor(Theme.muted)
            Button("Fermer") { dismiss() }.foregroundColor(Theme.primary)
        }
        .padding()
    }
}
