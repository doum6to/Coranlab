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
        Book(id: "tajwid",
             title: "Les Règles du Tajwid",
             author: "Quranlab",
             priceLabel: "4,99 €",
             productId: "app.quranlab.book.tajwid",
             blurb: "Un guide clair et illustré pour apprendre à réciter le Coran avec les règles essentielles du Tajwid.",
             gradient: [Color(hex: 0x6967FB), Color(hex: 0x9D8DF1)],
             extractPages: [
                "Introduction\n\nLe Tajwid est la science qui régit la belle récitation du Coran. Réciter avec Tajwid, c'est rendre à chaque lettre son droit : son point de sortie, ses caractéristiques et sa juste durée.",
                "Pourquoi apprendre le Tajwid ?\n\nLa récitation correcte préserve le sens et la beauté du texte. Une seule lettre mal prononcée peut changer la signification d'un mot. Le Tajwid protège donc le message.",
                "Les points de sortie (Makharij)\n\nChaque lettre arabe possède un endroit précis d'où elle est émise : la gorge, la langue, les lèvres ou la cavité nasale. Identifier ces points est la première étape.",
                "Les caractéristiques (Sifat)\n\nAu-delà du point de sortie, chaque lettre possède des attributs : la force, la douceur, le souffle, l'écho. Ce sont eux qui donnent à la lettre sa couleur sonore.",
                "Les règles du Noun et du Meem\n\nLe Noun sakinah et le Tanwin suivent quatre règles : l'assimilation, la transformation, la dissimulation et la clarté. Nous les détaillerons une à une.",
                "Le prolongement (Madd)\n\nLe Madd allonge la voyelle selon des durées précises, mesurées en temps. Maîtriser le Madd, c'est donner à la récitation son rythme apaisant.",
             ]),
        Book(id: "85mots",
             title: "Les 85 Mots du Coran",
             author: "Quranlab",
             priceLabel: "6,99 €",
             productId: "app.quranlab.book.85mots",
             blurb: "Comprends une grande partie du Coran en mémorisant seulement 85 mots qui reviennent le plus souvent.",
             gradient: [Color(hex: 0x0EA5A5), Color(hex: 0x34D399)],
             extractPages: [
                "L'idée\n\nUn petit nombre de mots revient des milliers de fois dans le Coran. En les apprenant, tu comprends une part immense du texte sans tout traduire.",
                "Mot 1 — مِنْ (min)\n\nSignifie « de / depuis ». Il apparaît plus de 3000 fois. Exemple : « min rabbihim » : de la part de leur Seigneur.",
                "Mot 2 — فِي (fî)\n\nSignifie « dans / en ». Très fréquent pour situer une action. Exemple : « fî al-ardi » : sur la terre.",
                "Mot 3 — الَّذِينَ (alladhîna)\n\nSignifie « ceux qui ». Introduit les croyants, les bienfaisants, les injustes… selon le contexte.",
                "Mot 4 — اللّٰه (Allah)\n\nLe Nom suprême, présent dans presque chaque page. Le reconnaître ancre immédiatement la lecture.",
                "Comment réviser\n\nReprends chaque mot dans plusieurs versets différents. La répétition dans des contextes variés fixe le sens durablement.",
             ]),
        Book(id: "histoires",
             title: "Histoires des Prophètes",
             author: "Quranlab",
             priceLabel: "7,99 €",
             productId: "app.quranlab.book.histoires",
             blurb: "Les récits des prophètes racontés simplement, avec les leçons à en tirer pour aujourd'hui.",
             gradient: [Color(hex: 0xF5923A), Color(hex: 0xF5C842)],
             extractPages: [
                "Avant-propos\n\nLes récits des prophètes ne sont pas de simples histoires : ce sont des miroirs. Chacun éclaire une épreuve, une patience, une espérance.",
                "Adam ع\n\nLe premier homme, façonné puis honoré. Son histoire enseigne le repentir : se tromper est humain, revenir est noble.",
                "Nûh ع\n\nDes années d'appel patient, puis l'arche. La leçon : la constance ne dépend pas du nombre de ceux qui écoutent.",
                "Ibrâhîm ع\n\nL'ami intime, briseur d'idoles. Sa vie est une quête de vérité menée par la raison et le cœur.",
                "Yûsuf ع\n\nDu puits au palais. Une leçon de pardon : il rendit le bien à ceux qui lui avaient nui.",
                "Mûsâ ع\n\nLe dialogue, le bâton, la mer ouverte. Le courage de parler face à l'injustice.",
             ]),
        Book(id: "douas",
             title: "Mes Premières Invocations",
             author: "Quranlab",
             priceLabel: "3,99 €",
             productId: "app.quranlab.book.douas",
             blurb: "Un recueil d'invocations du quotidien, avec l'arabe, la phonétique et la traduction.",
             gradient: [Color(hex: 0xE350E3), Color(hex: 0xFF6B5A)],
             extractPages: [
                "Comment utiliser ce livre\n\nChaque invocation est présentée en arabe, en phonétique simple, puis traduite. Commence par une seule par jour.",
                "Au réveil\n\n« Al-hamdu lillâhi alladhî ahyânâ… » : Louange à Allah qui nous a redonné la vie après nous avoir fait mourir, et vers Lui le retour.",
                "Avant de manger\n\n« Bismillâh » : Au nom d'Allah. Et si tu oublies au début : « Bismillâhi awwalahu wa âkhirahu ».",
                "En sortant de chez soi\n\n« Bismillâh, tawakkaltu 'alâ-llâh » : Au nom d'Allah, je place ma confiance en Allah.",
                "Contre l'anxiété\n\n« Hasbunâ-llâhu wa ni'ma-l-wakîl » : Allah nous suffit, quel excellent garant.",
                "Avant de dormir\n\n« Bismika-llâhumma amûtu wa ahyâ » : En Ton nom, ô Allah, je meurs et je vis.",
             ]),
    ]
}
