import SwiftUI

// MARK: - Exercise routing
enum ExerciseKind { case mc, opposite, vraiFaux, confidenceBet, spotError, matching, flashcard, anagram, flashRecall }

extension NativeChallenge {
    var kind: ExerciseKind {
        switch type {
        case "MATCHING":      return .matching
        case "FLASHCARD":     return .flashcard
        case "ANAGRAM":       return .anagram
        case "FLASH_RECALL":  return .flashRecall
        case "VRAI_FAUX":     return .vraiFaux
        case "CONFIDENCE_BET":return .confidenceBet
        case "OPPOSITE":      return .opposite
        case "SPOT_THE_ERROR":return .spotError
        default:              return .mc   // QCM, QCM_INVERSE, DRAG_DROP
        }
    }
    /// Pairs used by matching / flashcard (options carrying both texts).
    var pairs: [NativeOption] {
        options.filter { ($0.arabicText?.isEmpty == false) && ($0.frenchText?.isEmpty == false) }
    }
}

private func pairKey(_ o: NativeOption) -> Int { o.pairIndex ?? o.id }

// Shared option-card surface (#E0E0E0 border + 4px #D4D4D4 lip, states).
private func surface<S: View>(_ content: S, bg: Color, border: Color, lip: Color?) -> some View {
    content
        .background(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous).fill(bg))
        .overlay(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous).stroke(border, lineWidth: 2))
        .background(
            RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .fill(lip ?? .clear).offset(y: lip == nil ? 0 : 4)
        )
}

// MARK: - Matching (matching.tsx)
struct MatchingView: View {
    @ObservedObject var store: LessonStore
    let challenge: NativeChallenge

    @State private var shuffledFrench: [NativeOption] = []
    @State private var selectedArabic: Int? = nil
    @State private var matched: Set<Int> = []
    @State private var wrong: Int? = nil

    private var pairs: [NativeOption] { challenge.pairs }

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            column(title: "ARABE", items: pairs, arabic: true)
            column(title: "FRANÇAIS", items: shuffledFrench, arabic: false)
        }
        .frame(maxWidth: 460)
        .onAppear { if shuffledFrench.isEmpty { shuffledFrench = pairs.shuffled() } }
    }

    private func column(title: String, items: [NativeOption], arabic: Bool) -> some View {
        VStack(spacing: 10) {
            Text(title).font(.system(size: 10, weight: .bold)).tracking(0.5)
                .foregroundColor(Theme.muted)
            ForEach(items) { opt in cell(opt, arabic: arabic) }
        }
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder
    private func cell(_ opt: NativeOption, arabic: Bool) -> some View {
        let key = pairKey(opt)
        let isMatched = matched.contains(key)
        let isSel = !arabic ? false : selectedArabic == key
        let isWrong = !arabic && wrong == key
        let border = isMatched ? Theme.green.opacity(0.3) : isSel ? Theme.green : isWrong ? Theme.wrongBorder : Theme.cardBorder
        let bg: Color = isMatched ? Theme.success : isSel ? Theme.selectionBg : isWrong ? Theme.wrongBg : .white
        let lip: Color? = (isMatched || isSel || isWrong) ? nil : Theme.cardShadow

        Button { tap(opt, arabic: arabic) } label: {
            Group {
                if arabic {
                    Text(opt.arabicText ?? "")
                        .font(.system(size: 22, weight: .semibold, design: .serif))
                        .environment(\.layoutDirection, .rightToLeft)
                } else {
                    Text(opt.frenchText ?? "")
                        .font(.system(size: 13, weight: .semibold)).multilineTextAlignment(.center)
                }
            }
            .foregroundColor(Theme.text)
            .frame(maxWidth: .infinity, minHeight: 58)
            .padding(.horizontal, 6)
            .modifier(SurfaceMod(bg: bg, border: border, lip: lip))
        }
        .buttonStyle(.plain)
        .opacity(isMatched ? 0.6 : 1)
        .disabled(isMatched)
    }

    private func tap(_ opt: NativeOption, arabic: Bool) {
        guard store.status == .idle else { return }
        let key = pairKey(opt)
        if arabic {
            selectedArabic = key; wrong = nil
        } else {
            guard let sel = selectedArabic else { return }
            if sel == key {
                matched.insert(key); selectedArabic = nil; wrong = nil
                if matched.count == pairs.count {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        store.markCorrect(); Sounds.correct()
                        Task { await store.advance(); if store.finished { Sounds.finish() } }
                    }
                }
            } else {
                wrong = key
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { if wrong == key { wrong = nil } }
            }
        }
    }
}

// MARK: - Flashcard (flashcard.tsx) — learn (flip) then match, per chunk
struct FlashcardView: View {
    @ObservedObject var store: LessonStore
    let challenge: NativeChallenge

    @State private var chunkIndex = 0
    @State private var phase: Phase = .learn
    @State private var flipped: Set<Int> = []
    @State private var shuffledFrench: [NativeOption] = []
    @State private var selectedArabic: Int? = nil
    @State private var matched: Set<Int> = []
    @State private var wrong: Int? = nil

    enum Phase { case learn, match }

    private var pairs: [NativeOption] { challenge.pairs }
    private var chunkSize: Int { pairs.count <= 4 ? 2 : 4 }
    private var chunks: [[NativeOption]] {
        stride(from: 0, to: pairs.count, by: chunkSize).map { Array(pairs[$0..<min($0+chunkSize, pairs.count)]) }
    }
    private var chunk: [NativeOption] { chunkIndex < chunks.count ? chunks[chunkIndex] : [] }

    var body: some View {
        VStack(spacing: 18) {
            if phase == .learn {
                Text("Découvre les mots (\(chunkIndex + 1)/\(chunks.count))")
                    .font(.system(size: 13, weight: .semibold)).foregroundColor(Theme.muted)
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                    ForEach(Array(chunk.enumerated()), id: \.element.id) { idx, p in flipCard(idx, p) }
                }
                .frame(maxWidth: 460)
                ShinyButton(title: "Associer", variant: .green) { goMatch() }
                    .frame(maxWidth: 460)
            } else {
                Text("Associe les paires").font(.system(size: 13, weight: .semibold)).foregroundColor(Theme.muted)
                HStack(alignment: .top, spacing: 12) {
                    matchColumn(chunk, arabic: true)
                    matchColumn(shuffledFrench, arabic: false)
                }
                .frame(maxWidth: 460)
            }
        }
        .onAppear { if shuffledFrench.isEmpty { shuffledFrench = chunk.shuffled() } }
    }

    private func flipCard(_ idx: Int, _ p: NativeOption) -> some View {
        let isFlipped = flipped.contains(idx)
        return ZStack {
            surface(
                Text(isFlipped ? (p.frenchText ?? "") : (p.arabicText ?? ""))
                    .font(isFlipped ? .system(size: 18, weight: .bold) : .system(size: 30, weight: .bold, design: .serif))
                    .environment(\.layoutDirection, isFlipped ? .leftToRight : .rightToLeft)
                    .foregroundColor(isFlipped ? .white : Theme.text)
                    .rotation3DEffect(.degrees(isFlipped ? 180 : 0), axis: (x: 0, y: 1, z: 0))
                    .frame(maxWidth: .infinity).frame(height: 90).padding(8),
                bg: isFlipped ? Theme.green : .white,
                border: isFlipped ? Theme.green : Theme.cardBorder,
                lip: isFlipped ? nil : Theme.cardShadow
            )
        }
        .rotation3DEffect(.degrees(isFlipped ? 180 : 0), axis: (x: 0, y: 1, z: 0))
        .animation(.easeInOut(duration: 0.45), value: isFlipped)
        .onTapGesture { if flipped.contains(idx) { flipped.remove(idx) } else { flipped.insert(idx) } }
    }

    private func goMatch() {
        phase = .match; flipped = []; selectedArabic = nil; matched = []; wrong = nil
        shuffledFrench = chunk.shuffled()
    }

    private func matchColumn(_ items: [NativeOption], arabic: Bool) -> some View {
        VStack(spacing: 10) {
            ForEach(items) { opt in matchCell(opt, arabic: arabic) }
        }
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder
    private func matchCell(_ opt: NativeOption, arabic: Bool) -> some View {
        let key = pairKey(opt)
        let isMatched = matched.contains(key)
        let isSel = arabic && selectedArabic == key
        let isWrong = !arabic && wrong == key
        let border = isMatched ? Theme.green.opacity(0.3) : isSel ? Theme.green : isWrong ? Theme.wrongBorder : Theme.cardBorder
        let bg: Color = isMatched ? Theme.success : isSel ? Theme.selectionBg : isWrong ? Theme.wrongBg : .white
        Button { tap(opt, arabic: arabic) } label: {
            Group {
                if arabic {
                    Text(opt.arabicText ?? "").font(.system(size: 20, weight: .semibold, design: .serif))
                        .environment(\.layoutDirection, .rightToLeft)
                } else {
                    Text(opt.frenchText ?? "").font(.system(size: 13, weight: .semibold)).multilineTextAlignment(.center)
                }
            }
            .foregroundColor(Theme.text)
            .frame(maxWidth: .infinity, minHeight: 54).padding(.horizontal, 6)
            .modifier(SurfaceMod(bg: bg, border: border, lip: (isMatched || isSel || isWrong) ? nil : Theme.cardShadow))
        }
        .buttonStyle(.plain).opacity(isMatched ? 0.6 : 1).disabled(isMatched)
    }

    private func tap(_ opt: NativeOption, arabic: Bool) {
        guard store.status == .idle else { return }
        let key = pairKey(opt)
        if arabic { selectedArabic = key; wrong = nil; return }
        guard let sel = selectedArabic else { return }
        if sel == key {
            matched.insert(key); selectedArabic = nil; wrong = nil
            if matched.count == chunk.count {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { nextChunkOrFinish() }
            }
        } else {
            wrong = key
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { if wrong == key { wrong = nil } }
        }
    }

    private func nextChunkOrFinish() {
        if chunkIndex < chunks.count - 1 {
            chunkIndex += 1; phase = .learn; flipped = []; matched = []; selectedArabic = nil
            shuffledFrench = chunks[chunkIndex].shuffled()
        } else {
            store.markCorrect(); Sounds.correct()
            Task { await store.advance(); if store.finished { Sounds.finish() } }
        }
    }
}

// MARK: - Anagram (anagram.tsx)
struct AnagramView: View {
    @ObservedObject var store: LessonStore
    let challenge: NativeChallenge

    private struct Letter: Identifiable { let id: Int; let value: String }
    @State private var all: [Letter] = []
    @State private var selected: [Int] = []
    @State private var available: [Int] = []
    @State private var localStatus: LStatus = .none

    enum LStatus { case none, correct, wrong }

    private var target: String { (challenge.arabicWord ?? "").replacingOccurrences(of: " ", with: "") }

    var body: some View {
        VStack(spacing: 20) {
            // French prompt
            Text(challenge.frenchTranslation ?? "")
                .font(.system(size: 19, weight: .bold)).foregroundColor(Theme.green)
                .frame(maxWidth: 280).padding(.vertical, 16).padding(.horizontal, 12)
                .modifier(SurfaceMod(bg: Theme.selectionBg, border: Theme.green.opacity(0.3), lip: Theme.shinyOutlineShadow))

            // Assembled row — centered, right-to-left (Arabic reads RTL)
            HStack(spacing: 8) {
                ForEach(Array(selected.enumerated()), id: \.offset) { i, id in
                    letterChip(value: all.first { $0.id == id }?.value ?? "", filled: true)
                        .onTapGesture { if localStatus == .none { removeAt(i) } }
                }
            }
            .environment(\.layoutDirection, .rightToLeft)
            .frame(maxWidth: .infinity, minHeight: 56)
            .padding(8)
            .overlay(RoundedRectangle(cornerRadius: Theme.radiusSm).stroke(Theme.border, style: StrokeStyle(lineWidth: 2, dash: [6])))
            .frame(maxWidth: 360)

            // Available letters — centered
            HStack(spacing: 8) {
                ForEach(available, id: \.self) { id in
                    letterChip(value: all.first { $0.id == id }?.value ?? "", filled: false)
                        .onTapGesture { if localStatus == .none { pick(id) } }
                }
            }
            .frame(maxWidth: .infinity)

            if localStatus == .wrong {
                Text("Réponse : \(target)").font(.system(size: 14, weight: .semibold)).foregroundColor(Theme.wrongText)
            }

            HStack(spacing: 10) {
                if localStatus == .none {
                    ShinyButton(title: "Réinitialiser", variant: .outlineGreen) { reset() }
                    ShinyButton(title: "Vérifier", variant: selected.isEmpty ? .gray : .green,
                                disabled: selected.isEmpty) { check() }
                } else {
                    ShinyButton(title: "Continuer", variant: .green) {
                        Task { await store.advance(); if store.finished { Sounds.finish() } }
                    }
                }
            }
            .frame(maxWidth: 360)
        }
        .onAppear {
            if all.isEmpty {
                all = challenge.options.enumerated().map { Letter(id: $0.offset, value: $0.element.arabicText ?? $0.element.text) }
                available = all.map { $0.id }.shuffled()
            }
        }
    }

    private func letterChip(value: String, filled: Bool) -> some View {
        Text(value)
            .font(.system(size: 24, weight: .bold, design: .serif))
            .environment(\.layoutDirection, .rightToLeft)
            .foregroundColor(filled ? .white : Theme.text)
            .frame(minWidth: 44, minHeight: 44).padding(.horizontal, 6)
            .background(RoundedRectangle(cornerRadius: Theme.radiusSm).fill(filled ? Theme.green : .white))
            .overlay(RoundedRectangle(cornerRadius: Theme.radiusSm).stroke(filled ? Theme.green : Theme.cardBorder, lineWidth: 2))
    }

    private func pick(_ id: Int) { selected.append(id); available.removeAll { $0 == id } }
    private func removeAt(_ i: Int) { let id = selected[i]; selected.remove(at: i); available.append(id) }
    private func reset() { selected = []; available = all.map { $0.id }.shuffled(); localStatus = .none }
    private func check() {
        let assembled = selected.compactMap { id in all.first { $0.id == id }?.value }.joined()
        if assembled == target {
            localStatus = .correct; store.markCorrect(); Sounds.correct()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                Task { await store.advance(); if store.finished { Sounds.finish() } }
            }
        } else {
            localStatus = .wrong; store.markWrong(); Sounds.incorrect()
        }
    }
}

// MARK: - SurfaceMod (reusable card surface modifier)
struct SurfaceMod: ViewModifier {
    let bg: Color; let border: Color; let lip: Color?
    func body(content: Content) -> some View {
        content
            .background(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous).fill(bg))
            .overlay(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous).stroke(border, lineWidth: 2))
            .background(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .fill(lip ?? .clear).offset(y: lip == nil ? 0 : 4))
    }
}

// MARK: - Simple flow layout for the anagram chips
struct FlowRow: Layout {
    var spacing: CGFloat = 8
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxW = proposal.width ?? 360
        var x: CGFloat = 0, y: CGFloat = 0, rowH: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x + s.width > maxW { x = 0; y += rowH + spacing; rowH = 0 }
            x += s.width + spacing; rowH = max(rowH, s.height)
        }
        return CGSize(width: maxW, height: y + rowH)
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let maxW = bounds.width
        var x = bounds.minX, y = bounds.minY, rowH: CGFloat = 0
        for v in subviews {
            let s = v.sizeThatFits(.unspecified)
            if x + s.width > bounds.minX + maxW { x = bounds.minX; y += rowH + spacing; rowH = 0 }
            v.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(s))
            x += s.width + spacing; rowH = max(rowH, s.height)
        }
    }
}

// MARK: - Shared exercise pieces (faithful to qcm.tsx / vrai-faux.tsx)

/// White bordered box holding the Arabic prompt (boxShadow 0 4px 0 0 #D4D4D4).
struct ArabicBox: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 34, weight: .bold, design: .serif))
            .environment(\.layoutDirection, .rightToLeft)
            .foregroundColor(Theme.text)
            .frame(maxWidth: 280)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .modifier(SurfaceMod(bg: .white, border: Theme.cardBorder, lip: Theme.cardShadow))
            .frame(maxWidth: 280)
    }
}

/// French prompt box (QCM_INVERSE) — solid brand box.
struct FrenchPromptBox: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 22, weight: .bold))
            .foregroundColor(.white)
            .frame(maxWidth: 280)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous).fill(Theme.green))
            .frame(maxWidth: 280)
    }
}

/// Single-column option list (mobile `grid-cols-1`) with numbered square badges
/// and the exact selected / correct / wrong states from qcm.tsx.
struct OptionList: View {
    let options: [NativeOption]
    let selectedId: Int?
    let revealed: Bool
    var onSelect: (Int) -> Void

    var body: some View {
        VStack(spacing: 10) {
            ForEach(Array(options.enumerated()), id: \.element.id) { i, o in
                row(o, number: i + 1)
            }
        }
        .frame(maxWidth: 440)
    }

    private func row(_ o: NativeOption, number: Int) -> some View {
        let isSel = selectedId == o.id
        var border = Theme.cardBorder, bg = Color.white, fg = Theme.text
        var lip: Color? = Theme.cardShadow
        var dim = false
        if revealed {
            if o.correct { border = Theme.correctBorder; bg = Theme.correctBg; fg = Theme.green; lip = nil }
            else if isSel { border = Theme.wrongBorder; bg = Theme.wrongBg; fg = Theme.wrongText; lip = nil }
            else { dim = true }
        } else if isSel {
            border = Theme.green; bg = Theme.selectionBg; fg = Theme.text; lip = nil
        }
        let badgeColor = (isSel && !revealed) ? Theme.green
            : (revealed && o.correct) ? Theme.green
            : (revealed && isSel) ? Theme.wrongText : Theme.muted

        return Button { onSelect(o.id) } label: {
            HStack(spacing: 12) {
                Text("\(number)")
                    .font(.system(size: 12, weight: .bold)).foregroundColor(badgeColor)
                    .frame(width: 24, height: 24)
                    .overlay(RoundedRectangle(cornerRadius: 7).stroke(badgeColor.opacity(0.9), lineWidth: 2))
                Text(o.label)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(fg).multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, 14)
            .frame(maxWidth: .infinity, minHeight: 54)
            .modifier(SurfaceMod(bg: bg, border: border, lip: lip))
            .opacity(dim ? 0.4 : 1)
        }
        .buttonStyle(.plain)
        .disabled(revealed)
    }
}

// MARK: - VRAI / FAUX (vrai-faux.tsx)
struct VraiFauxView: View {
    @ObservedObject var store: LessonStore
    let challenge: NativeChallenge

    private var vrai: NativeOption? { challenge.options.first { $0.text.uppercased() == "VRAI" } }
    private var faux: NativeOption? { challenge.options.first { $0.text.uppercased() == "FAUX" } }

    var body: some View {
        VStack(spacing: 14) {
            ArabicBox(text: challenge.arabicWord ?? "")
            // proposed translation
            Text("= « \(challenge.frenchTranslation ?? "") » ?")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(Theme.green)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 280)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .modifier(SurfaceMod(bg: Theme.selectionBg, border: Theme.green.opacity(0.3), lip: Theme.shinyOutlineShadow))
                .frame(maxWidth: 280)
            HStack(spacing: 12) {
                if let v = vrai { bigButton("VRAI", v) }
                if let f = faux { bigButton("FAUX", f) }
            }
            .frame(maxWidth: 360)
        }
    }

    private func bigButton(_ label: String, _ o: NativeOption) -> some View {
        let isSel = store.selectedOptionId == o.id
        let revealed = store.status != .idle
        var border = Theme.cardBorder, bg = Color.white, fg = Theme.text
        var lip: Color? = Theme.cardShadow; var dim = false
        if revealed {
            if o.correct { border = Theme.correctBorder; bg = Theme.correctBg; fg = Theme.green; lip = nil }
            else if isSel { border = Theme.wrongBorder; bg = Theme.wrongBg; fg = Theme.wrongText; lip = nil }
            else { dim = true }
        } else if isSel { border = Theme.green; bg = Theme.selectionBg; fg = Theme.green; lip = nil }
        return Button { store.select(o.id) } label: {
            Text(label).font(.system(size: 20, weight: .bold)).foregroundColor(fg)
                .frame(maxWidth: .infinity, minHeight: 72)
                .modifier(SurfaceMod(bg: bg, border: border, lip: lip))
                .opacity(dim ? 0.4 : 1)
        }
        .buttonStyle(.plain).disabled(revealed)
    }
}

// MARK: - Confidence bet (confidence-bet.tsx) — bet phase then answer phase
struct ConfidenceBetView: View {
    @ObservedObject var store: LessonStore
    let challenge: NativeChallenge
    @State private var bet: String? = nil
    @State private var phase: Phase = .bet
    enum Phase { case bet, answer }

    private let bets: [(id: String, label: String, desc: String)] = [
        ("sure", "Je suis sûr(e)", "+20 XP si correct, -10 XP si faux"),
        ("hesitant", "J'hésite", "+10 XP si correct, -5 XP si faux"),
        ("fifty", "50/50", "+5 XP si correct, 0 XP si faux"),
    ]

    var body: some View {
        VStack(spacing: 14) {
            ArabicBox(text: challenge.arabicWord ?? "")
            if phase == .bet {
                Text("Avant de voir les réponses, parie sur ta confiance !")
                    .font(.system(size: 13, weight: .medium)).foregroundColor(Theme.muted)
                    .multilineTextAlignment(.center)
                Text("Tu peux gagner plus d'XP… ou en perdre")
                    .font(.system(size: 11)).foregroundColor(Color(hex: 0x9CA3AF))
                VStack(spacing: 10) {
                    ForEach(bets, id: \.id) { b in betCard(b) }
                }
                .frame(maxWidth: 360)
            } else {
                Text(bets.first { $0.id == bet }?.label ?? "")
                    .font(.system(size: 12, weight: .semibold)).foregroundColor(Theme.text)
                    .padding(.horizontal, 12).padding(.vertical, 6)
                    .background(Capsule().fill(Theme.selectionBg))
                Text("Quelle est la traduction ?")
                    .font(.system(size: 13)).foregroundColor(Theme.muted)
                OptionList(options: challenge.options, selectedId: store.selectedOptionId,
                           revealed: store.status != .idle, onSelect: { store.select($0) })
            }
        }
    }

    private func betCard(_ b: (id: String, label: String, desc: String)) -> some View {
        let sel = bet == b.id
        return Button {
            bet = b.id
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { withAnimation { phase = .answer } }
        } label: {
            VStack(alignment: .leading, spacing: 2) {
                Text(b.label).font(.system(size: 15, weight: .bold)).foregroundColor(Theme.text)
                Text(b.desc).font(.system(size: 11)).foregroundColor(Color(hex: 0x9CA3AF))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16).padding(.vertical, 14)
            .modifier(SurfaceMod(bg: sel ? Theme.selectionBg : .white,
                                 border: sel ? Theme.green : Theme.cardBorder,
                                 lip: sel ? nil : Theme.cardShadow))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Spot the error (spot-the-error.tsx) — pick the FALSE pair (correct == false)
struct SpotTheErrorView: View {
    @ObservedObject var store: LessonStore
    let challenge: NativeChallenge
    @State private var selectedId: Int? = nil

    private var wrongPair: NativeOption? { challenge.options.first { !$0.correct } }

    var body: some View {
        VStack(spacing: 14) {
            Text("Une de ces paires est fausse. Trouve l'erreur !")
                .font(.system(size: 13, weight: .medium)).foregroundColor(Theme.muted)
                .multilineTextAlignment(.center)
            VStack(spacing: 10) { ForEach(challenge.options) { pairRow($0) } }
                .frame(maxWidth: 440)
            if store.status == .wrong {
                VStack(spacing: 4) {
                    Text("Pas tout à fait").font(.system(size: 12, weight: .semibold)).foregroundColor(Theme.wrongText)
                    HStack(spacing: 6) {
                        Text("La paire fausse :").font(.system(size: 13)).foregroundColor(Theme.text)
                        Text(wrongPair?.arabicText ?? "").font(.system(size: 16, weight: .bold, design: .serif))
                            .environment(\.layoutDirection, .rightToLeft)
                        Text("= \(wrongPair?.frenchText ?? "")").font(.system(size: 13, weight: .semibold)).foregroundColor(Theme.text)
                    }
                }
                .padding(12).frame(maxWidth: 440)
                .background(RoundedRectangle(cornerRadius: Theme.radius).fill(Theme.wrongBg))
            }
            HStack {
                Spacer(minLength: 0)
                if store.status == .idle {
                    ShinyButton(title: "C'est celle-ci !",
                                variant: selectedId == nil ? .gray : .green,
                                disabled: selectedId == nil) { verify() }
                        .frame(maxWidth: 220)
                } else if store.status == .wrong {
                    ShinyButton(title: "Continuer", variant: .green) {
                        Task { await store.advance(); if store.finished { Sounds.finish() } }
                    }.frame(maxWidth: 220)
                }
            }
            .frame(maxWidth: 440)
        }
    }

    private func pairRow(_ o: NativeOption) -> some View {
        let isSel = selectedId == o.id
        let revealed = store.status != .idle
        var border = Theme.cardBorder, bg = Color.white
        var lip: Color? = Theme.cardShadow; var dim = false
        if revealed {
            if !o.correct { border = Theme.green; bg = Theme.success; lip = nil }   // the actual wrong pair
            else if isSel { border = Theme.wrongBorder; bg = Theme.wrongBg; lip = nil } // user picked a valid pair
            else { dim = true }
        } else if isSel { border = Theme.green; bg = Theme.selectionBg; lip = nil }
        return Button { if !revealed { selectedId = o.id } } label: {
            HStack {
                Text(o.arabicText ?? "").font(.system(size: 18, weight: .semibold, design: .serif))
                    .environment(\.layoutDirection, .rightToLeft).foregroundColor(Theme.text)
                Spacer(minLength: 8)
                Text("=").font(.system(size: 13)).foregroundColor(Theme.muted)
                Spacer(minLength: 8)
                Text(o.frenchText ?? "").font(.system(size: 13, weight: .semibold))
                    .foregroundColor(Theme.text).multilineTextAlignment(.trailing)
            }
            .padding(.horizontal, 14).frame(maxWidth: .infinity, minHeight: 56)
            .modifier(SurfaceMod(bg: bg, border: border, lip: lip))
            .opacity(dim ? 0.5 : 1)
        }
        .buttonStyle(.plain).disabled(revealed)
    }

    private func verify() {
        guard let id = selectedId, let opt = challenge.options.first(where: { $0.id == id }) else { return }
        if !opt.correct {           // user correctly found the false pair
            store.markCorrect(); Sounds.correct()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                Task { await store.advance(); if store.finished { Sounds.finish() } }
            }
        } else {
            store.markWrong(); Sounds.incorrect()
        }
    }
}
