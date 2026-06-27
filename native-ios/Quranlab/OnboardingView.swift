import SwiftUI

// Faithful port of app/onboarding/page.tsx — Koji intro, progress bar,
// personalized question steps, "Continuer" (dark) button. Shown once on first
// launch (gated by @AppStorage in RootView).

struct OnbOption: Identifiable { let id: String; let label: String; let response: String }

enum OnbStep {
    case intro(String)
    case question(id: String, title: String, options: [OnbOption])
}

struct OnboardingView: View {
    var onComplete: () -> Void

    @State private var stepIndex = 0
    @State private var answers: [String: String] = [:]
    @State private var greetingBeat = false

    private let steps: [OnbStep] = [
        .intro("Salam alaykoum, je suis Koji !"),
        .question(id: "focus", title: "Pourquoi veux-tu apprendre les mots du Coran ?", options: [
            OnbOption(id: "prayer", label: "Comprendre le sens pendant la prière", response: "Magnifique, chaque mot prendra vie !"),
            OnbOption(id: "read", label: "Lire le Coran sans traduction", response: "Bravo, un objectif puissant !"),
            OnbOption(id: "faith", label: "Approfondir ma foi", response: "Superbe intention, on avance ensemble."),
            OnbOption(id: "vocab", label: "Enrichir mon vocabulaire arabe", response: "Excellent, on construit mot à mot !"),
            OnbOption(id: "curious", label: "Par simple curiosité", response: "Parfait, la curiosité est un cadeau."),
        ]),
        .question(id: "time", title: "Combien de temps par jour ?", options: [
            OnbOption(id: "10", label: "10 min", response: "Parfait, on avance chaque jour."),
            OnbOption(id: "20", label: "20 min", response: "Top, le rythme idéal !"),
            OnbOption(id: "30", label: "30 min", response: "Bravo, tu vas vite progresser."),
            OnbOption(id: "60", label: "60 min", response: "Impressionnant, tu iras loin !"),
        ]),
        .intro("Tout est prêt ! Créons ton compte."),
    ]

    // MARK: derived
    private var step: OnbStep { steps[stepIndex] }
    private var isIntro: Bool { if case .intro = step { return true }; return false }
    private var isLast: Bool { stepIndex == steps.count - 1 }
    private var questionId: String? { if case let .question(id, _, _) = step { return id }; return nil }
    private var currentAnswer: String? { questionId.flatMap { answers[$0] } }
    private var canContinue: Bool { isIntro || currentAnswer != nil }
    private var progress: Double { Double(stepIndex + 1) / Double(steps.count) }
    private var titleText: String {
        switch step {
        case .intro(let t):
            if stepIndex == 0 && greetingBeat { return "Créons ensemble un parcours d'apprentissage personnalisé !" }
            return t
        case .question(_, let t, let opts):
            if let a = currentAnswer, let sel = opts.first(where: { $0.id == a }) { return sel.response }
            return t
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            if isIntro { introContent } else { questionContent }
            ShinyButton(title: "Continuer", variant: .dark, disabled: !canContinue) {
                if isLast { onComplete() }
                else { withAnimation(.easeOut(duration: 0.25)) { stepIndex += 1 } }
            }
            .opacity(canContinue ? 1 : 0.5)
            .padding(.horizontal, 20).padding(.bottom, 20)
        }
        .background(Color.white.ignoresSafeArea())
        .onAppear(perform: scheduleBeat)
        .onChange(of: stepIndex) { i in
            if i != 0 { greetingBeat = false } else { scheduleBeat() }
        }
    }

    // MARK: header
    private var header: some View {
        HStack(spacing: 12) {
            Button { if stepIndex > 0 { withAnimation { stepIndex -= 1 } } } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 20, weight: .semibold)).foregroundColor(Theme.muted)
            }
            .opacity(stepIndex == 0 ? 0 : 1).disabled(stepIndex == 0)
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color(hex: 0xE5E7EB))
                    Capsule().fill(Theme.green).frame(width: g.size.width * progress)
                        .animation(.easeOut(duration: 0.5), value: progress)
                }
            }
            .frame(height: 8)
        }
        .padding(.horizontal, 16).padding(.top, 16)
    }

    // MARK: intro
    private var introContent: some View {
        VStack(spacing: 22) {
            Spacer()
            MascotView(size: 170, riv: "mascot_breath")
            Text(titleText)
                .font(.system(size: 20, weight: .bold))
                .multilineTextAlignment(.center)
                .foregroundColor(Theme.text)
                .padding(.horizontal, 28).headingStyle()
            Spacer()
        }
    }

    // MARK: question
    private var questionContent: some View {
        VStack(spacing: 18) {
            HStack(alignment: .top, spacing: 12) {
                MascotView(size: 96)
                Text(titleText)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(Theme.text)
                    .frame(maxWidth: .infinity, alignment: .leading).headingStyle()
            }
            .padding(.horizontal, 20).padding(.top, 8)

            options
            Spacer()
        }
    }

    @ViewBuilder
    private var options: some View {
        if case let .question(id, _, opts) = step {
            if id == "time" {
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 16), GridItem(.flexible(), spacing: 16)], spacing: 16) {
                    ForEach(opts) { o in timeCard(o) }
                }
                .padding(.horizontal, 28)
            } else {
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(opts) { o in pill(o) }
                }
                .padding(.horizontal, 24)
            }
        }
    }

    private func selectedFill(_ selected: Bool) -> LinearGradient {
        selected
            ? LinearGradient(colors: [Color(hex: 0xF0F0FF), Color(hex: 0xD9BBFF)], startPoint: .leading, endPoint: .trailing)
            : LinearGradient(colors: [Color(hex: 0xF3F4F6), Color(hex: 0xF3F4F6)], startPoint: .leading, endPoint: .trailing)
    }

    private func pill(_ o: OnbOption) -> some View {
        let selected = currentAnswer == o.id
        let hasSel = currentAnswer != nil
        return Button { select(o) } label: {
            Text(o.label)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(selected ? Theme.text : (hasSel ? Theme.muted : Theme.text))
                .padding(.horizontal, 22).padding(.vertical, 12)
                .background(Capsule().fill(selectedFill(selected)))
        }
        .buttonStyle(.plain)
    }

    private func timeCard(_ o: OnbOption) -> some View {
        let selected = currentAnswer == o.id
        return Button { select(o) } label: {
            VStack(spacing: 10) {
                Image("timer_\(o.id)").resizable().scaledToFit().frame(width: 52, height: 52)
                Text(o.label).font(.system(size: 14, weight: .bold)).foregroundColor(Theme.text)
            }
            .frame(maxWidth: .infinity)
            .aspectRatio(1, contentMode: .fit)
            .background(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous).fill(selectedFill(selected)))
        }
        .buttonStyle(.plain)
    }

    // MARK: actions
    private func select(_ o: OnbOption) {
        if let id = questionId { withAnimation(.easeOut(duration: 0.15)) { answers[id] = o.id } }
    }
    private func scheduleBeat() {
        guard stepIndex == 0 else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            if stepIndex == 0 { withAnimation(.easeInOut(duration: 0.3)) { greetingBeat = true } }
        }
    }
}
