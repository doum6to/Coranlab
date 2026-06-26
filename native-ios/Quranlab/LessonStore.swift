import Foundation

/// Quiz engine for one lesson: loads challenges, tracks selection/answer state,
/// and records completion at the end (points/streak via the native endpoint).
@MainActor
final class LessonStore: ObservableObject {
    enum Status: Equatable { case idle, correct, wrong }

    @Published var challenges: [NativeChallenge] = []
    @Published var index = 0
    @Published var selectedOptionId: Int?
    @Published var status: Status = .idle
    @Published var isLoading = true
    @Published var errorMessage: String?
    @Published var finished = false
    @Published var correctCount = 0

    let lessonId: Int
    private let session: SessionStore

    init(lessonId: Int, session: SessionStore) {
        self.lessonId = lessonId
        self.session = session
    }

    var current: NativeChallenge? {
        index < challenges.count ? challenges[index] : nil
    }
    var total: Int { challenges.count }
    var progress: Double { total == 0 ? 0 : Double(index) / Double(total) }

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        guard let token = await session.accessToken() else {
            errorMessage = "Session expirée. Reconnecte-toi."
            return
        }
        var req = URLRequest(
            url: SupabaseConfig.apiBaseURL.appendingPathComponent("api/native/lesson/\(lessonId)")
        )
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        do {
            let (data, resp) = try await URLSession.shared.data(for: req)
            guard let http = resp as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
                errorMessage = "Erreur de chargement."
                return
            }
            let decoded = try JSONDecoder().decode(LessonResponse.self, from: data)
            challenges = decoded.challenges
            if challenges.isEmpty { errorMessage = "Cette leçon est vide." }
        } catch {
            errorMessage = "Impossible de charger la leçon."
        }
    }

    func select(_ optionId: Int) {
        guard status == .idle else { return }
        selectedOptionId = optionId
    }

    func check() {
        guard let c = current else { return }
        if c.isMultipleChoice {
            let chosen = c.options.first { $0.id == selectedOptionId }
            let ok = chosen?.correct == true
            status = ok ? .correct : .wrong
            if ok { correctCount += 1 }
        } else {
            // Simplified (flashcard / matching / anagram …): mark as done.
            status = .correct
            correctCount += 1
        }
    }

    func advance() async {
        if index + 1 >= total {
            await finish()
        } else {
            index += 1
            selectedOptionId = nil
            status = .idle
        }
    }


    /// Self-contained exercises (matching/flashcard/anagram) report their own
    /// result instead of going through select()/check().
    func markCorrect() {
        guard status == .idle else { return }
        status = .correct
        correctCount += 1
    }
    func markWrong() {
        guard status == .idle else { return }
        status = .wrong
    }

    private func finish() async {
        guard let token = await session.accessToken() else {
            finished = true
            return
        }
        var req = URLRequest(
            url: SupabaseConfig.apiBaseURL.appendingPathComponent("api/native/lesson-complete")
        )
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        let ids = challenges.map { $0.id }
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["challengeIds": ids])
        _ = try? await URLSession.shared.data(for: req)
        finished = true
    }
}
