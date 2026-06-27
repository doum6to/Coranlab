import SwiftUI
import RevenueCat

/// A purchasable ebook.
struct Book: Identifiable, Equatable {
    let id: String            // slug
    let title: String
    let author: String
    let priceLabel: String    // fallback display price (used if the store product isn't loaded)
    let productId: String     // App Store / RevenueCat product identifier (non-consumable)
    let blurb: String
    let gradient: [Color]
    let extractPages: [String]   // first pages shown as a free excerpt

    static func == (l: Book, r: Book) -> Bool { l.id == r.id }
}

/// Holds the ebook catalog, ownership state, and purchase flow (RevenueCat).
@MainActor
final class BooksStore: ObservableObject {
    @Published var books: [Book] = BooksStore.sample
    @Published var ownedIds: Set<String> = []
    @Published var busyId: String? = nil
    @Published var message: String? = nil

    var ownedBooks: [Book] { books.filter { ownedIds.contains($0.id) } }

    func loadOwnership() async {
        if Purchases.isConfigured, let info = try? await Purchases.shared.customerInfo() {
            apply(info)
        } else {
            ownedIds = Self.localOwned()
        }
    }

    private func apply(_ info: CustomerInfo) {
        let purchased = Set(info.nonSubscriptions.map { $0.productIdentifier })
        let fromStore = Set(books.filter { purchased.contains($0.productId) }.map { $0.id })
        ownedIds = fromStore.union(Self.localOwned())
    }

    func purchase(_ book: Book) async {
        message = nil
        busyId = book.id
        defer { busyId = nil }
        guard Purchases.isConfigured else {
            message = "Les achats ne sont pas encore disponibles."
            return
        }
        let products = await Purchases.shared.products([book.productId])
        guard let product = products.first else {
            message = "Ce livre n'est pas encore disponible à l'achat."
            return
        }
        do {
            let result = try await Purchases.shared.purchase(product: product)
            if !result.userCancelled {
                apply(result.customerInfo)
                Self.addLocal(book.id)
                ownedIds.insert(book.id)
            }
        } catch {
            message = error.localizedDescription
        }
    }

    /// Supplies the current Supabase access token (set from MainTabView).
    var tokenProvider: (() async -> String?)?

    /// Asks the backend for a short-lived signed URL to the full (purchased) book.
    func fullBookURL(_ book: Book) async -> URL? {
        guard let token = await tokenProvider?() else { return nil }
        var comps = URLComponents(
            url: SupabaseConfig.apiBaseURL.appendingPathComponent("api/native/book-url"),
            resolvingAgainstBaseURL: false
        )
        comps?.queryItems = [URLQueryItem(name: "productId", value: book.productId)]
        guard let url = comps?.url else { return nil }
        var req = URLRequest(url: url)
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        guard let (data, resp) = try? await URLSession.shared.data(for: req),
              let http = resp as? HTTPURLResponse, http.statusCode == 200,
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let s = obj["url"] as? String, let signed = URL(string: s) else { return nil }
        return signed
    }

    func download(_ url: URL) async -> Data? {
        try? await URLSession.shared.data(from: url).0
    }

    func restore() async {
        guard Purchases.isConfigured else { return }
        if let info = try? await Purchases.shared.restorePurchases() { apply(info) }
    }

    // MARK: - local fallback persistence
    private static let key = "ownedBookIds"
    static func localOwned() -> Set<String> {
        Set(UserDefaults.standard.stringArray(forKey: key) ?? [])
    }
    static func addLocal(_ id: String) {
        var s = localOwned(); s.insert(id)
        UserDefaults.standard.set(Array(s), forKey: key)
    }

    // MARK: - catalog (edit titles/prices here; product IDs must exist in App Store Connect)
    static let sample: [Book] = [
        Book(id: "douas",
             title: "Du'âs du Coran",
             author: "Quranlab",
             priceLabel: "24 €",
             productId: "app.quranlab.book.douas",
             blurb: "Le recueil des invocations tirées du Coran, en arabe, avec la translittération et la traduction. Les paroles que les prophètes ont adressées à Allah, à méditer et à mémoriser.",
             gradient: [Color(hex: 0xE350E3), Color(hex: 0xFF6B5A)],
             extractPages: [
                "Du'âs du Coran",
                "Les invocations du Coran, en arabe, phonétique et traduction.",
             ]),
        Book(id: "85mots",
             title: "85% des Mots du Coran",
             author: "Quranlab",
             priceLabel: "14 €",
             productId: "app.quranlab.book.85mots",
             blurb: "Apprends les mots qui reviennent le plus souvent dans le Coran et comprends jusqu'à 85% du texte. Une méthode efficace, mot après mot, pour saisir le sens de ta lecture.",
             gradient: [Color(hex: 0x0EA5A5), Color(hex: 0x34D399)],
             extractPages: [
                "85% des Mots du Coran",
                "Les mots les plus fréquents du Coran, expliqués.",
             ]),
        Book(id: "juzz",
             title: "Résumé des 30 Juz'",
             author: "Quranlab",
             priceLabel: "4 €",
             productId: "app.quranlab.book.juzz",
             blurb: "Un résumé clair de chacun des 30 juz' du Coran : les thèmes essentiels et le fil conducteur de chaque partie, pour garder une vue d'ensemble de ta lecture.",
             gradient: [Color(hex: 0x6967FB), Color(hex: 0x9D8DF1)],
             extractPages: [
                "Résumé des 30 Juz'",
                "Les thèmes essentiels de chaque partie du Coran.",
             ]),
    ]
}