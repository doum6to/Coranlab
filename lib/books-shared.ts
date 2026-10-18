/**
 * Client-safe catalogue model for the web "Boutique" (same 3 ebooks as the
 * iOS store). PDFs live in the PRIVATE Supabase Storage bucket "books" as
 * "<slug>.pdf"; the iOS product id is "app.quranlab.book.<slug>". Prices and
 * copy are admin-editable; slugs are fixed (they name the files).
 */

export type BookSlug = "85mots" | "dous" | "juzz";
export const BOOK_SLUGS: BookSlug[] = ["85mots", "dous", "juzz"];

export type Book = {
  slug: BookSlug;
  title: string;
  subtitle: string;
  description: string;
  /** Cover image URL (admin upload). Empty → generated cover. */
  cover: string;
  /** Accent colour used by the generated cover / badges. */
  color: string;
  /** Sold separately unless included with Premium. */
  includedWithPremium: boolean;
  amountCents: number;
  priceLabel: string;
  compareLabel: string;
  /** Short selling points (shop card + upsell). */
  bullets: string[];
  /** Pages, format… shown under the title. */
  meta: string;
};

export type BooksContent = {
  shopTitle: string;
  shopSubtitle: string;
  tabShop: string;
  tabLibrary: string;
  includedLabel: string;
  ownedLabel: string;
  buyLabel: string;
  readLabel: string;
  premiumLabel: string;
  emptyLibrary: string;
  books: Book[];
};

export const BOOKS_KEY = "books_content";

export const BOOKS_DEFAULTS: BooksContent = {
  shopTitle: "Bibliothèque",
  shopSubtitle: "Les livres Quranlab, à lire directement dans l'app.",
  tabShop: "Boutique",
  tabLibrary: "Ma bibliothèque",
  includedLabel: "Inclus avec Premium",
  ownedLabel: "Dans ta bibliothèque",
  buyLabel: "Obtenir pour {price}",
  readLabel: "Lire",
  premiumLabel: "Débloquer avec Premium",
  emptyLibrary: "Aucun livre pour l'instant. Découvre la boutique.",
  books: [
    {
      slug: "85mots",
      title: "85 % des mots du Coran",
      subtitle: "Les 500 mots essentiels",
      description: "Le guide des 500 mots qui composent 85 % du texte coranique, classés par fréquence et par thème, avec leur sens et un verset d'exemple.",
      cover: "",
      color: "#3B6FD9",
      includedWithPremium: true,
      amountCents: 999,
      priceLabel: "9,99 €",
      compareLabel: "19,99 €",
      bullets: ["500 mots = 85 % du Coran", "Un verset d'exemple par mot", "Lecture dans l'app, à vie"],
      meta: "PDF · lecture dans l'app",
    },
    {
      slug: "dous",
      title: "Du'as du Coran",
      subtitle: "Toutes les invocations du Coran",
      description: "Toutes les du'as présentes dans le Coran, en arabe, phonétique et traduction, avec leur contexte. À lire et à retenir pour ta prière.",
      cover: "",
      color: "#B4562D",
      includedWithPremium: false,
      amountCents: 999,
      priceLabel: "9,99 €",
      compareLabel: "19,99 €",
      bullets: ["Toutes les invocations du Coran", "Arabe, phonétique et traduction", "Classées par situation"],
      meta: "PDF · lecture dans l'app",
    },
    {
      slug: "juzz",
      title: "Juz résumé par Juz",
      subtitle: "Comprendre le Coran, partie par partie",
      description: "Le résumé de chaque juz du Coran : les thèmes, les récits et les enseignements, pour suivre le fil du Livre de bout en bout.",
      cover: "",
      color: "#6B7280",
      includedWithPremium: false,
      amountCents: 499,
      priceLabel: "4,99 €",
      compareLabel: "14,99 €",
      bullets: ["Les 30 juz résumés", "Thèmes et enseignements clés", "Idéal pour le Ramadan"],
      meta: "PDF · lecture dans l'app",
    },
  ],
};

export const bookProductId = (slug: BookSlug) => `app.quranlab.book.${slug}`;
/** course_purchase.product_type value for a web purchase of this book. */
export const bookPurchaseType = (slug: BookSlug) => `book_${slug}`;
export const isBookSlug = (v: unknown): v is BookSlug => typeof v === "string" && (BOOK_SLUGS as string[]).includes(v);

const s = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
const n = (v: unknown, fb: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : fb);

export function mergeBooksContent(stored: Partial<BooksContent> | null): BooksContent {
  const d = BOOKS_DEFAULTS;
  if (!stored) return d;
  const storedBooks = Array.isArray(stored.books) ? stored.books : [];
  return {
    shopTitle: s(stored.shopTitle, d.shopTitle),
    shopSubtitle: s(stored.shopSubtitle, d.shopSubtitle),
    tabShop: s(stored.tabShop, d.tabShop),
    tabLibrary: s(stored.tabLibrary, d.tabLibrary),
    includedLabel: s(stored.includedLabel, d.includedLabel),
    ownedLabel: s(stored.ownedLabel, d.ownedLabel),
    buyLabel: s(stored.buyLabel, d.buyLabel),
    readLabel: s(stored.readLabel, d.readLabel),
    premiumLabel: s(stored.premiumLabel, d.premiumLabel),
    emptyLibrary: s(stored.emptyLibrary, d.emptyLibrary),
    // Slugs are fixed: merge per slug so a book can't be lost or renamed.
    books: d.books.map((db) => {
      const sb = (storedBooks as any[]).find((b) => b?.slug === db.slug) ?? {};
      return {
        slug: db.slug,
        title: s(sb.title, db.title),
        subtitle: s(sb.subtitle, db.subtitle),
        description: s(sb.description, db.description),
        cover: s(sb.cover, db.cover),
        color: /^#[0-9a-fA-F]{3,8}$/.test(s(sb.color, "")) ? sb.color : db.color,
        includedWithPremium: typeof sb.includedWithPremium === "boolean" ? sb.includedWithPremium : db.includedWithPremium,
        amountCents: n(sb.amountCents, db.amountCents),
        priceLabel: s(sb.priceLabel, db.priceLabel),
        compareLabel: s(sb.compareLabel, db.compareLabel),
        bullets: Array.isArray(sb.bullets) ? sb.bullets.filter((x: unknown): x is string => typeof x === "string") : db.bullets,
        meta: s(sb.meta, db.meta),
      };
    }),
  };
}
