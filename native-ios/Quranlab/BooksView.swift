import SwiftUI
import PDFKit
import UIKit

extension Book {
    /// Bundled cover rendered from the book's first page ("<id>_cover.png").
    var coverImage: UIImage? {
        guard let u = Bundle.main.url(forResource: "\(id)_cover", withExtension: "png") else { return nil }
        return UIImage(contentsOfFile: u.path)
    }
}

/// Boutique + Catalogue (ebooks). One tab with a Boutique / Ma bibliothèque toggle.
struct BooksScreen: View {
    @ObservedObject var store: BooksStore
    var session: SessionStore
    var isPro: Bool
    var onPremium: () -> Void

    @State private var tab = 0            // 0 = boutique, 1 = catalogue
    @State private var detail: Book?
    @State private var reader: Book?

    private let cols = [GridItem(.flexible(), spacing: 14), GridItem(.flexible(), spacing: 14)]

    private func statusLabel(_ b: Book) -> String {
        if store.purchasedOutright(b) { return "Acheté" }
        if store.isPro { return "Inclus" }
        return b.priceLabel
    }

    var body: some View {
        VStack(spacing: 0) {
            ScreenHeader(title: "Bibliothèque")

            Picker("", selection: $tab) {
                Text("Boutique").tag(0)
                Text("Ma bibliothèque").tag(1)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 16)
            .padding(.top, 4)
            .padding(.bottom, 10)

            ScrollView(showsIndicators: false) {
                if tab == 0 { boutique } else { catalogue }
            }
        }
        .background(Color.white.ignoresSafeArea())
        .task {
            store.tokenProvider = { await session.accessToken() }
            store.isPro = isPro
            await store.loadOwnership()
        }
        .onChange(of: isPro) { store.isPro = $0 }
        .sheet(item: $detail) { b in
            BookDetailView(book: b, store: store, onPremium: onPremium)
        }
        .fullScreenCover(item: $reader) { b in
            ReaderView(book: b, store: store, owned: store.owns(b), onPremium: onPremium)
        }
    }

    // MARK: Boutique
    private var boutique: some View {
        VStack(spacing: 16) {
            if !isPro {
                Button(action: onPremium) {
                    HStack(spacing: 12) {
                        Image(systemName: "crown.fill").font(.system(size: 20)).foregroundColor(.white)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Devenir Premium").font(.system(size: 16, weight: .bold)).foregroundColor(.white)
                            Text("Tous les livres inclus, en illimité").font(.system(size: 12)).foregroundColor(.white.opacity(0.9))
                        }
                        Spacer()
                        Image(systemName: "chevron.right").foregroundColor(.white.opacity(0.9))
                    }
                    .padding(16)
                    .background(PremiumFill().clipShape(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)))
                }
            }

            LazyVGrid(columns: cols, spacing: 16) {
                ForEach(store.books) { b in
                    Button { detail = b } label: { BookCard(book: b, owned: store.owns(b), label: statusLabel(b)) }
                        .buttonStyle(.plain)
                }
            }
        }
        .padding(16)
    }

    // MARK: Catalogue
    private var catalogue: some View {
        Group {
            if store.ownedBooks.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "books.vertical").font(.system(size: 46)).foregroundColor(Theme.muted)
                    Text("Tu ne possèdes aucun livre").font(.system(size: 17, weight: .bold)).foregroundColor(Theme.text)
                    Text("Découvre la boutique pour commencer ta bibliothèque.")
                        .font(.system(size: 14)).foregroundColor(Theme.muted).multilineTextAlignment(.center)
                    ShinyButton(title: "Découvrir", variant: .green) { tab = 0 }
                        .frame(maxWidth: 220)
                }
                .frame(maxWidth: .infinity)
                .padding(.top, 60).padding(.horizontal, 24)
            } else {
                LazyVGrid(columns: cols, spacing: 16) {
                    ForEach(store.ownedBooks) { b in
                        Button { reader = b } label: { BookCard(book: b, owned: true, label: store.purchasedOutright(b) ? "Acheté" : "Inclus") }
                            .buttonStyle(.plain)
                    }
                }
                .padding(16)
            }
        }
    }
}

/// A book cover card (gradient + title).
struct BookCard: View {
    let book: Book
    var owned: Bool = false
    var label: String = ""
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .bottomLeading) {
                if let img = book.coverImage {
                    Image(uiImage: img).resizable().scaledToFill()
                        .aspectRatio(0.72, contentMode: .fit)
                        .frame(maxWidth: .infinity)
                        .clipped()
                } else {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(LinearGradient(colors: book.gradient, startPoint: .topLeading, endPoint: .bottomTrailing))
                        .aspectRatio(0.72, contentMode: .fit)
                    VStack(alignment: .leading, spacing: 4) {
                        Spacer()
                        Text(book.title).font(.system(size: 15, weight: .heavy)).foregroundColor(.white)
                            .lineLimit(3).minimumScaleFactor(0.8)
                        Text(book.author).font(.system(size: 11, weight: .semibold)).foregroundColor(.white.opacity(0.85))
                    }
                    .padding(12)
                }
                if owned {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundColor(.white).padding(8)
                        .background(Circle().fill(Theme.green).opacity(0.9).padding(4))
                        .frame(maxWidth: .infinity, alignment: .topTrailing)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.black.opacity(0.08), lineWidth: 1))
            Text(label.isEmpty ? (owned ? "Acheté" : book.priceLabel) : label)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(owned ? Theme.green : Theme.text)
        }
    }
}

/// Book detail sheet: blurb + read excerpt + buy.
struct BookDetailView: View {
    let book: Book
    @ObservedObject var store: BooksStore
    var onPremium: () -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var showReader = false

    private var owned: Bool { store.owns(book) }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                HStack(alignment: .top, spacing: 16) {
                    Group {
                        if let img = book.coverImage {
                            Image(uiImage: img).resizable().scaledToFill()
                        } else {
                            LinearGradient(colors: book.gradient, startPoint: .topLeading, endPoint: .bottomTrailing)
                                .overlay(Text(book.title).font(.system(size: 13, weight: .heavy)).foregroundColor(.white)
                                    .multilineTextAlignment(.center).padding(10))
                        }
                    }
                    .frame(width: 110, height: 150)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    VStack(alignment: .leading, spacing: 6) {
                        Text(book.title).font(.system(size: 20, weight: .bold)).foregroundColor(Theme.text)
                        Text(book.author).font(.system(size: 14)).foregroundColor(Theme.muted)
                        if owned {
                            Text(store.isPro && !store.purchasedOutright(book) ? "Inclus avec Premium ✓" : "Dans ta bibliothèque ✓").font(.system(size: 13, weight: .bold)).foregroundColor(Theme.green)
                        } else {
                            Text(book.priceLabel).font(.system(size: 18, weight: .heavy)).foregroundColor(Theme.text)
                        }
                    }
                    Spacer()
                }
                Text(book.blurb).font(.system(size: 15)).foregroundColor(Theme.text).lineSpacing(3)

                if let msg = store.message {
                    Text(msg).font(.footnote).foregroundColor(Theme.wrongText)
                }

                VStack(spacing: 12) {
                    ShinyButton(title: "Lire l'extrait", variant: .outlineGreen) { showReader = true }
                    if owned {
                        ShinyButton(title: "Lire", variant: .green) { showReader = true }
                    } else {
                        ShinyButton(title: store.busyId == book.id ? "Achat…" : "Je le veux  ·  \(book.priceLabel)",
                                    variant: .green, disabled: store.busyId != nil) {
                            Task { await store.purchase(book) }
                        }
                    }
                    Button("Restaurer mes achats") { Task { await store.restore() } }
                        .font(.system(size: 13)).foregroundColor(Theme.muted)
                }
            }
            .padding(20)
        }
        .background(Color.white.ignoresSafeArea())
        .overlay(alignment: .topTrailing) {
            Button { dismiss() } label: {
                Image(systemName: "xmark").font(.headline).foregroundColor(Theme.muted).padding(16)
            }
        }
        .fullScreenCover(isPresented: $showReader) {
            ReaderView(book: book, store: store, owned: owned, onPremium: onPremium)
        }
    }
}

/// Book reader. Real PDF via PDFKit (full book for owners / Premium, otherwise
/// the bundled excerpt). For owned books: resume where you left off, bookmarks,
/// and a page slider. Falls back to text until PDFs are present.
struct ReaderView: View {
    let book: Book
    @ObservedObject var store: BooksStore
    var owned: Bool
    var onPremium: () -> Void
    @Environment(\.dismiss) private var dismiss

    @StateObject private var pdf = PDFController()
    @State private var mode: Mode = .loading
    @State private var page = 0          // text fallback only
    @State private var showBookmarks = false

    enum Mode { case loading, pdf, text }

    private var pages: [String] { book.extractPages }

    var body: some View {
        VStack(spacing: 0) {
            topBar
            switch mode {
            case .loading:
                Spacer(); ProgressView(); Spacer()
            case .pdf:
                PDFKitView(controller: pdf)
                if owned && pdf.count > 1 { sliderBar }
                arrowBar(current: pdf.page, total: pdf.count, prev: { pdf.prev() }, next: { pdf.next() })
            case .text:
                TabView(selection: $page) {
                    ForEach(pages.indices, id: \.self) { i in
                        ScrollView {
                            Text(pages[i]).font(.system(size: 17)).foregroundColor(Theme.text).lineSpacing(6)
                                .frame(maxWidth: .infinity, alignment: .leading).padding(24)
                        }.tag(i)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                arrowBar(current: page, total: pages.count,
                         prev: { if page > 0 { withAnimation { page -= 1 } } },
                         next: { if page < pages.count - 1 { withAnimation { page += 1 } } })
            }
            if !owned { purchaseBar }
        }
        .background(Color.white.ignoresSafeArea())
        .task { await loadContent() }
        .sheet(isPresented: $showBookmarks) { bookmarksSheet }
    }

    private var topBar: some View {
        HStack(spacing: 14) {
            Text(book.title).font(.system(size: 16, weight: .bold)).foregroundColor(Theme.text).lineLimit(1)
            Spacer()
            if owned && mode == .pdf {
                Button { pdf.toggleBookmark() } label: {
                    Image(systemName: pdf.bookmarks.contains(pdf.page) ? "bookmark.fill" : "bookmark")
                        .foregroundColor(pdf.bookmarks.contains(pdf.page) ? Theme.green : Theme.muted)
                }
                Button { showBookmarks = true } label: {
                    Image(systemName: "list.bullet").foregroundColor(Theme.muted)
                }
                .disabled(pdf.bookmarks.isEmpty).opacity(pdf.bookmarks.isEmpty ? 0.3 : 1)
            }
            Button { dismiss() } label: { Image(systemName: "xmark").foregroundColor(Theme.muted) }
        }
        .font(.system(size: 18))
        .padding(.horizontal, 18).padding(.vertical, 14)
    }

    private var sliderBar: some View {
        HStack(spacing: 12) {
            Slider(
                value: Binding(get: { Double(pdf.page) },
                               set: { pdf.goTo(Int($0.rounded())) }),
                in: 0...Double(max(pdf.count - 1, 1))
            )
            .tint(Theme.green)
        }
        .padding(.horizontal, 24).padding(.top, 6)
    }

    private func arrowBar(current: Int, total: Int, prev: @escaping () -> Void, next: @escaping () -> Void) -> some View {
        HStack {
            Button(action: prev) { Image(systemName: "chevron.left").font(.system(size: 20, weight: .bold)) }
                .disabled(current == 0).opacity(current == 0 ? 0.3 : 1)
            Spacer()
            Text("Page \(min(current + 1, max(total, 1))) / \(max(total, 1))")
                .font(.system(size: 13, weight: .semibold)).foregroundColor(Theme.muted)
            Spacer()
            Button(action: next) { Image(systemName: "chevron.right").font(.system(size: 20, weight: .bold)) }
                .disabled(total > 0 && current >= total - 1).opacity(total > 0 && current >= total - 1 ? 0.3 : 1)
        }
        .foregroundColor(Theme.text)
        .padding(.horizontal, 28).padding(.vertical, 12)
    }

    private var isLastExtractPage: Bool {
        mode == .pdf ? (pdf.count > 0 && pdf.page >= pdf.count - 1) : (page >= pages.count - 1)
    }

    private var purchaseBar: some View {
        VStack(spacing: 10) {
            Text(isLastExtractPage ? "Fin de l'extrait" : "Extrait gratuit")
                .font(.system(size: isLastExtractPage ? 15 : 12, weight: isLastExtractPage ? .bold : .regular))
                .foregroundColor(isLastExtractPage ? Theme.text : Theme.muted)
            if isLastExtractPage {
                Text("Débloque la lecture complète").font(.system(size: 12)).foregroundColor(Theme.muted)
            }
            ShinyButton(title: store.busyId == book.id ? "Achat…" : "Acheter  ·  \(book.priceLabel)",
                        variant: .green, disabled: store.busyId != nil) {
                Task { await store.purchase(book); if store.owns(book) { await loadContent() } }
            }
            Button { onPremium() } label: {
                HStack(spacing: 8) {
                    Image(systemName: "crown.fill")
                    Text("Tous les livres avec Premium").font(.system(size: 15, weight: .bold))
                }
                .foregroundColor(.white).frame(maxWidth: .infinity).padding(.vertical, 13)
                .background(PremiumFill().clipShape(RoundedRectangle(cornerRadius: Theme.radius, style: .continuous)))
            }
            if let msg = store.message {
                Text(msg).font(.footnote).foregroundColor(Theme.wrongText)
            }
        }
        .padding(.horizontal, 20).padding(.bottom, 20).padding(.top, 6)
    }

    private var bookmarksSheet: some View {
        let marks = pdf.bookmarks.sorted()
        return NavigationView {
            List {
                if marks.isEmpty {
                    Text("Aucun marque-page").foregroundColor(Theme.muted)
                } else {
                    ForEach(marks, id: \.self) { i in
                        Button {
                            pdf.goTo(i); showBookmarks = false
                        } label: {
                            HStack {
                                Image(systemName: "bookmark.fill").foregroundColor(Theme.green)
                                Text("Page \(i + 1)").foregroundColor(Theme.text)
                                Spacer()
                            }
                        }
                    }
                    .onDelete { idx in
                        for k in idx { pdf.removeBookmark(marks[k]) }
                    }
                }
            }
            .navigationTitle("Marque-pages")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func loadContent() async {
        mode = .loading
        pdf.configure(bookId: book.id, persist: owned)
        // 1. Owner / Premium → full book from the secure endpoint.
        if owned, let url = await store.fullBookURL(book),
           let data = await store.download(url), let doc = PDFDocument(data: data) {
            pdf.load(doc, restore: true); mode = .pdf; return
        }
        // 2. Bundled excerpt PDF.
        if let u = Bundle.main.url(forResource: "\(book.id)_extract", withExtension: "pdf"),
           let doc = PDFDocument(url: u) {
            pdf.load(doc, restore: owned); mode = .pdf; return
        }
        // 3. Text fallback.
        mode = .text
    }
}

/// Drives a PDFView for SwiftUI: paging, resume position, and bookmarks.
final class PDFController: ObservableObject {
    let view = PDFView()
    @Published var page = 0
    @Published var count = 0
    @Published var bookmarks: Set<Int> = []

    private var bookId = ""
    private var persist = false

    init() {
        view.autoScales = true
        view.displayMode = .singlePage
        view.displayDirection = .horizontal
        view.usePageViewController(true)
        view.backgroundColor = .white
        NotificationCenter.default.addObserver(
            self, selector: #selector(pageChanged), name: .PDFViewPageChanged, object: view)
    }

    func configure(bookId: String, persist: Bool) {
        self.bookId = bookId
        self.persist = persist
        bookmarks = persist
            ? Set((UserDefaults.standard.array(forKey: "bm_\(bookId)") as? [Int]) ?? [])
            : []
    }

    func load(_ doc: PDFDocument, restore: Bool) {
        view.document = doc
        count = doc.pageCount
        var start = 0
        if persist && restore {
            start = min(max(UserDefaults.standard.integer(forKey: "rp_\(bookId)"), 0), max(count - 1, 0))
        }
        if let p = doc.page(at: start) { view.go(to: p) }
        page = start
    }

    func goTo(_ i: Int) {
        guard let doc = view.document, i >= 0, i < doc.pageCount, let p = doc.page(at: i) else { return }
        view.go(to: p)
    }
    func next() { view.goToNextPage(nil) }
    func prev() { view.goToPreviousPage(nil) }

    func toggleBookmark() {
        if bookmarks.contains(page) { bookmarks.remove(page) } else { bookmarks.insert(page) }
        saveBookmarks()
    }
    func removeBookmark(_ i: Int) { bookmarks.remove(i); saveBookmarks() }
    private func saveBookmarks() {
        guard persist else { return }
        UserDefaults.standard.set(Array(bookmarks), forKey: "bm_\(bookId)")
    }

    @objc private func pageChanged() {
        guard let doc = view.document, let cur = view.currentPage else { return }
        page = doc.index(for: cur)
        count = doc.pageCount
        if persist { UserDefaults.standard.set(page, forKey: "rp_\(bookId)") }
    }
}

struct PDFKitView: UIViewRepresentable {
    let controller: PDFController
    func makeUIView(context: Context) -> PDFView { controller.view }
    func updateUIView(_ uiView: PDFView, context: Context) {}
}
