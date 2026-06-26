import Foundation

struct LeaderboardMember: Codable, Identifiable {
    let userId: String
    let name: String
    let weeklyXp: Int
    let isCurrentUser: Bool
    let rank: Int
    var id: String { userId }
}
struct LeaderboardTier: Codable, Identifiable {
    let tier: String
    let label: String
    var id: String { tier }
}
struct LeaderboardResponse: Codable {
    let joined: Bool
    let tier: String?
    let tierLabel: String?
    let members: [LeaderboardMember]?
    let tiers: [LeaderboardTier]?
}

@MainActor
final class LeaderboardStore: ObservableObject {
    @Published var resp: LeaderboardResponse?
    @Published var isLoading = true
    @Published var errorMessage: String?

    private let session: SessionStore
    init(session: SessionStore) { self.session = session }

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        guard let token = await session.accessToken() else {
            errorMessage = "Session expirée."; return
        }
        var req = URLRequest(url: SupabaseConfig.apiBaseURL.appendingPathComponent("api/native/leaderboard"))
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        req.cachePolicy = .reloadIgnoringLocalCacheData
        do {
            let (data, r) = try await URLSession.shared.data(for: req)
            guard let http = r as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
                errorMessage = "Erreur de chargement."; return
            }
            resp = try JSONDecoder().decode(LeaderboardResponse.self, from: data)
        } catch {
            errorMessage = "Hors ligne — réessaie plus tard."
        }
    }
}
