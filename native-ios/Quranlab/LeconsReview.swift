import SwiftUI

// Faithful to the web Leçons page (app/(main)/lecons/list/[listId]/page.tsx):
// a VOCABULARY REVIEW — header + a grid of flip cards (Arabic ↔ French),
// NOT the exercise/quiz flow. Words are aggregated from the list's levels.

struct VocabWord: Identifiable, Hashable {
    let id: String      // arabic text as stable key
    let arabic: String
    let french: String
}

struct ReviewTarget: Identifiable {
    let id: Int
    let list: LearnList
    let unitTitle: String
}

@MainActor
final class ReviewStore: ObservableObject {
    @Published var words: [VocabWord] = []
    @Published var isLoading = true
    @Published var errorMessage: String?

    private let session: SessionStore
    init(session: SessionStore) { self.session = session }

    func load(_ list: LearnList) async {
        isLoading = true; errorMessage = nil
        defer { isLoading = false }
        guard let token = await session.accessToken() else {
            errorMessage = "Session expirée."; return
        }
        var collected: [String: VocabWord] = [:]
        // Fetch every level of the list and aggregate unique Arabic↔French pairs.
        for level in list.levels {
            guard let url = URL(string: SupabaseConfig.apiBaseURL
                .appendingPathComponent("api/native/lesson/\(level.id)").absoluteString) else { continue }
            var req = URLRequest(url: url)
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            guard let (data, resp) = try? await URLSession.shared.data(for: req),
                  let http = resp as? HTTPURLResponse, (200...299).contains(http.statusCode),
                  let decoded = try? JSONDecoder().decode(LessonResponse.self, from: data) else { continue }
            for c in decoded.challenges {
                if let a = c.arabicWord, !a.isEmpty, let f = c.frenchTranslation, !f.isEmpty {
                    collected[a] = VocabWord(id: a, arabic: a, french: f)
                }
                for o in c.options {
                    if let a = o.arabicText, !a.isEmpty, let f = o.frenchText, !f.isEmpty {
                        collected[a] = VocabWord(id: a, arabic: a, french: f)
                    }
                }
            }
        }
        words = Array(collected.values).sorted { $0.french < $1.french }
        if words.isEmpty { errorMessage = "Aucun mot à réviser pour le moment." }
    }
}

struct LeconsReviewView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var store: ReviewStore
    let target: ReviewTarget

    init(target: ReviewTarget, session: SessionStore) {
        self.target = target
        _store = StateObject(wrappedValue: ReviewStore(session: session))
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    header
                    if store.isLoading {
                        LoadingView().padding(.top, 40)
                    } else if let e = store.errorMessage {
                        Text(e).foregroundColor(Theme.muted).padding(.top, 40)
                    } else {
                        Text("Vocabulaire · \(store.words.count) mots")
                            .font(.system(size: 16, weight: .bold))
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .foregroundColor(Theme.text).headingStyle()
                        LazyVGrid(columns: [GridItem(.flexible(), spacing: 12),
                                            GridItem(.flexible(), spacing: 12)], spacing: 12) {
                            ForEach(store.words) { w in FlipWordCard(word: w) }
                        }
                    }
                }
                .padding(20)
                .frame(maxWidth: 640)
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
        .task { await store.load(target.list) }
    }

    private var header: some View {
        VStack(spacing: 8) {
            Image("lesson_illustration")
                .resizable().scaledToFill()
                .frame(width: 104, height: 104)
                .blendMode(.multiply)
                .clipShape(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous))
            Text(target.unitTitle.uppercased())
                .font(.system(size: 11, weight: .semibold)).tracking(0.5)
                .foregroundColor(Theme.muted)
            Text(target.list.listTitle)
                .font(.system(size: 26, weight: .bold)).foregroundColor(Theme.text)
                .multilineTextAlignment(.center).headingStyle()
        }
        .padding(.top, 8)
    }
}

private struct FlipWordCard: View {
    let word: VocabWord
    @State private var flipped = false
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: Theme.radius, style: .continuous).fill(flipped ? Theme.green : .white)
            RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .stroke(flipped ? Theme.green : Theme.cardBorder, lineWidth: 2)
            VStack(spacing: 2) {
                Text(flipped ? word.french : word.arabic)
                    .font(flipped ? .system(size: 16, weight: .bold)
                                  : .system(size: 26, weight: .bold, design: .serif))
                    .environment(\.layoutDirection, flipped ? .leftToRight : .rightToLeft)
                    .foregroundColor(flipped ? .white : Theme.text)
                    .multilineTextAlignment(.center)
                if !flipped {
                    let tr = Transliteration.ar(word.arabic)
                    if !tr.isEmpty {
                        Text(tr).font(.system(size: 10, weight: .medium)).italic().foregroundColor(Theme.muted)
                    }
                }
            }
            .padding(8)
            // counter-rotate so the back face text isn't mirrored
            .rotation3DEffect(.degrees(flipped ? 180 : 0), axis: (x: 0, y: 1, z: 0))
        }
        .frame(height: 96)
        .background(
            RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)
                .fill(flipped ? Color.clear : Theme.cardShadow).offset(y: flipped ? 0 : 4)
        )
        .rotation3DEffect(.degrees(flipped ? 180 : 0), axis: (x: 0, y: 1, z: 0))
        .animation(.easeInOut(duration: 0.4), value: flipped)
        .onTapGesture { flipped.toggle() }
    }
}
