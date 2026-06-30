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
    @Published var totalChoices = 0   // every choice (incl. wrong pairs) counts

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

        // Auth optional: guests can play free lessons (App Store 5.1.1(v)).
        let token = await session.accessToken()
        var req = URLRequest(
            url: SupabaseConfig.apiBaseURL.appendingPathComponent("api/native/lesson/\(lessonId)")
        )
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
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
        let ok = c.options.first { $0.id == selectedOptionId }?.correct == true
        status = ok ? .correct : .wrong
        record(ok)
    }

    /// Records a single user choice (correct or not) for the success %.
    func record(_ correct: Bool) {
        totalChoices += 1
        if correct { correctCount += 1 }
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
        record(true)
        status = .correct
    }
    func markWrong() {
        guard status == .idle else { return }
        record(false)
        status = .wrong
    }

    /// A level is validated only at >= 90% correct (web parity).
    var passed: Bool { totalChoices > 0 && Double(correctCount) / Double(totalChoices) >= 0.9 }

    func reset() {
        index = 0
        selectedOptionId = nil
        status = .idle
        correctCount = 0
        totalChoices = 0
        finished = false
    }

    private func finish() async {
        // Only mark the level complete on the server if the user passed (>=90%).
        if passed, let token = await session.accessToken() {
            var req = URLRequest(
                url: SupabaseConfig.apiBaseURL.appendingPathComponent("api/native/lesson-complete")
            )
            req.httpMethod = "POST"
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            let ids = challenges.map { $0.id }
            req.httpBody = try? JSONSerialization.data(withJSONObject: ["challengeIds": ids])
            _ = try? await URLSession.shared.data(for: req)
        }
        finished = true
    }
}
