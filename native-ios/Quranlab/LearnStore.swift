import Foundation

/// Loads the "Apprendre" data from the native endpoint, with a local cache so
/// the screen appears instantly on launch and survives a flaky/offline network.
@MainActor
final class LearnStore: ObservableObject {
    @Published var units: [LearnUnit] = []
    @Published var isPro = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let session: SessionStore

    init(session: SessionStore) {
        self.session = session
    }

    private var cacheURL: URL {
        let dir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
        return dir.appendingPathComponent("learn-cache.json")
    }

    /// Show cached data immediately (if any), then refresh from the network.
    func loadCacheThenRefresh() async {
        if units.isEmpty,
           let data = try? Data(contentsOf: cacheURL),
           let cached = try? JSONDecoder().decode(LearnResponse.self, from: data) {
            units = cached.units
            isPro = cached.isPro
        }
        await refresh()
    }

    func refresh() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        guard let token = await session.accessToken() else {
            if units.isEmpty { errorMessage = "Session expirée. Reconnecte-toi." }
            return
        }

        var comps = URLComponents(
            url: SupabaseConfig.apiBaseURL.appendingPathComponent("api/native/learn"),
            resolvingAgainstBaseURL: false
        )!
        comps.queryItems = [URLQueryItem(name: "locale", value: "fr")]

        var req = URLRequest(url: comps.url!)
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        req.cachePolicy = .reloadIgnoringLocalCacheData

        do {
            let (data, resp) = try await URLSession.shared.data(for: req)
            guard let http = resp as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
                if units.isEmpty { errorMessage = "Erreur de chargement." }
                return
            }
            let decoded = try JSONDecoder().decode(LearnResponse.self, from: data)
            units = decoded.units
            isPro = decoded.isPro
            try? data.write(to: cacheURL, options: .atomic)
        } catch {
            // Keep showing cached data; only surface an error if we have nothing.
            if units.isEmpty { errorMessage = "Hors ligne — réessaie plus tard." }
        }
    }
}
