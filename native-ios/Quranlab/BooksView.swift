import SwiftUI

/// Boutique + Catalogue (ebooks). One tab with a Boutique / Ma bibliothèque toggle.
struct BooksScreen: View {
    @ObservedObject var store: BooksStore
    var isPro: Bool
    var onPremium: () -> Void

    @State private var tab = 0            // 0 = boutique, 1 = catalogue
    @State private var detail: Book?
    @State private var reader: Book?

    private let cols = [GridItem(.flexible(), spacing: 14), GridItem(.flexible(), spacing: 14)]

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
        .task { await store.loadOwnership() }
        .sheet(item: $detail) { b in
            BookDetailView(book: b, store: store)
        }
        .fullScreenCover(item: $reader) { b in
            ReaderView(book: b, store: store, owned: store.ownedIds.contains(b.id))
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
                            Text("Toutes les leçons débloquées").font(.system(size: 12)).foregroundColor(.white.opacity(0.9))
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
                    Button { detail = b } label: { BookCard(book: b, owned: store.ownedIds.contains(b.id)) }
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
                        Button { reader = b } label: { BookCard(book: b, owned: true) }
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
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .bottomLeading) {
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
                if owned {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundColor(.white).padding(8)
                        .frame(maxWidth: .infinity, alignment: .topTrailing)
                }
            }
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.black.opacity(0.06), lineWidth: 1))
            Text(owned ? "Acheté" : book.priceLabel)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(owned ? Theme.green : Theme.text)
        }
    }
}

/// Book detail sheet: blurb + read excerpt + buy.
struct BookDetailView: View {
    let book: Book
    @ObservedObject var store: BooksStore
    @Environment(\.dismiss) private var dismiss
    @State private var showReader = false

    private var owned: Bool { store.ownedIds.contains(book.id) }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                HStack(alignment: .top, spacing: 16) {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(LinearGradient(colors: book.gradient, startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(width: 110, height: 150)
                        .overlay(Text(book.title).font(.system(size: 13, weight: .heavy)).foregroundColor(.white)
                            .multilineTextAlignment(.center).padding(10))
                    VStack(alignment: .leading, spacing: 6) {
                        Text(book.title).font(.system(size: 20, weight: .bold)).foregroundColor(Theme.text)
                        Text(book.author).font(.system(size: 14)).foregroundColor(Theme.muted)
                        if owned {
                            Text("Dans ta bibliothèque ✓").font(.system(size: 13, weight: .bold)).foregroundColor(Theme.green)
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
            ReaderView(book: book, store: store, owned: owned)
        }
    }
}

/// Paginated excerpt / book reader with left-right arrows.
struct ReaderView: View {
    let book: Book
    @ObservedObject var store: BooksStore
    var owned: Bool
    @Environment(\.dismiss) private var dismiss
    @State private var page = 0

    private var pages: [String] { book.extractPages }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text(book.title).font(.system(size: 16, weight: .bold)).foregroundColor(Theme.text).lineLimit(1)
                Spacer()
                Button { dismiss() } label: { Image(systemName: "xmark").foregroundColor(Theme.muted) }
            }
            .padding(.horizontal, 18).padding(.vertical, 14)

            TabView(selection: $page) {
                ForEach(pages.indices, id: \.self) { i in
                    ScrollView {
                        Text(pages[i])
                            .font(.system(size: 17)).foregroundColor(Theme.text).lineSpacing(6)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(24)
                    }
                    .tag(i)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))

            HStack {
                Button { if page > 0 { withAnimation { page -= 1 } } } label: {
                    Image(systemName: "chevron.left").font(.system(size: 20, weight: .bold))
                }
                .disabled(page == 0).opacity(page == 0 ? 0.3 : 1)
                Spacer()
                Text("Page \(page + 1) / \(pages.count)").font(.system(size: 13, weight: .semibold)).foregroundColor(Theme.muted)
                Spacer()
                Button { if page < pages.count - 1 { withAnimation { page += 1 } } } label: {
                    Image(systemName: "chevron.right").font(.system(size: 20, weight: .bold))
                }
                .disabled(page == pages.count - 1).opacity(page == pages.count - 1 ? 0.3 : 1)
            }
            .foregroundColor(Theme.text)
            .padding(.horizontal, 28).padding(.vertical, 12)

            if !owned {
                VStack(spacing: 8) {
                    Text("Extrait — \(pages.count) premières pages").font(.system(size: 12)).foregroundColor(Theme.muted)
                    ShinyButton(title: store.busyId == book.id ? "Achat…" : "Je le veux  ·  \(book.priceLabel)",
                                variant: .green, disabled: store.busyId != nil) {
                        Task { await store.purchase(book); if store.ownedIds.contains(book.id) { dismiss() } }
                    }
                    if let msg = store.message {
                        Text(msg).font(.footnote).foregroundColor(Theme.wrongText)
                    }
                }
                .padding(.horizontal, 20).padding(.bottom, 20).padding(.top, 4)
            }
        }
        .background(Color.white.ignoresSafeArea())
    }
}
