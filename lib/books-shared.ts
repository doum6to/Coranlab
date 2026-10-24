/**
 * Client-safe catalogue model for the web "Boutique" (same 3 ebooks as the
 * iOS store). PDFs live in the PRIVATE Supabase Storage bucket "books" as
 * "<slug>.pdf"; the iOS product id is "app.quranlab.book.<slug>". Prices and
 * copy are admin-editable; slugs are fixed (they name the files).
 */

export type BookSlug = "85mots" | "dous" | "juzz";
export const BOOK_SLUGS: BookSlug[] = ["85mots", "dous", "juzz"];

/** Translated copy of a book (the PDF itself stays in French for now). */
export type BookI18n = { title: string; subtitle: string; description: string; bullets: string[]; meta: string };

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
  /** English / Spanish copy (admin-editable). */
  i18n: { en: BookI18n; es: BookI18n };
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
      i18n: {
        en: { title: "85% of the words of the Qur'an", subtitle: "The 500 essential words", description: "The guide to the 500 words that make up 85% of the Qur'anic text, sorted by frequency and theme, with their meaning and an example verse.", bullets: ["500 words = 85% of the Qur'an", "One example verse per word", "Read in the app, for life"], meta: "PDF · read in the app" },
        es: { title: "El 85% de las palabras del Corán", subtitle: "Las 500 palabras esenciales", description: "La guía de las 500 palabras que forman el 85% del texto coránico, por frecuencia y tema, con su significado y un versículo de ejemplo.", bullets: ["500 palabras = 85% del Corán", "Un versículo de ejemplo por palabra", "Lectura en la app, de por vida"], meta: "PDF · lectura en la app" },
      },
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
      i18n: {
        en: { title: "Du'as of the Qur'an", subtitle: "Every supplication in the Qur'an", description: "Every du'a found in the Qur'an, in Arabic, transliteration and translation, with its context. To read and remember for your prayer.", bullets: ["Every supplication in the Qur'an", "Arabic, transliteration and translation", "Sorted by situation"], meta: "PDF · read in the app" },
        es: { title: "Du'as del Corán", subtitle: "Todas las súplicas del Corán", description: "Todas las du'as del Corán, en árabe, transliteración y traducción, con su contexto. Para leer y recordar en tu oración.", bullets: ["Todas las súplicas del Corán", "Árabe, transliteración y traducción", "Clasificadas por situación"], meta: "PDF · lectura en la app" },
      },
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
      i18n: {
        en: { title: "Juz by Juz summary", subtitle: "Understand the Qur'an, part by part", description: "A summary of each juz of the Qur'an: the themes, stories and lessons, to follow the thread of the Book from start to finish.", bullets: ["All 30 juz summarised", "Key themes and lessons", "Ideal for Ramadan"], meta: "PDF · read in the app" },
        es: { title: "Resumen Juz por Juz", subtitle: "Entender el Corán, parte por parte", description: "El resumen de cada juz del Corán: temas, relatos y enseñanzas, para seguir el hilo del Libro de principio a fin.", bullets: ["Los 30 juz resumidos", "Temas y enseñanzas clave", "Ideal para el Ramadán"], meta: "PDF · lectura en la app" },
      },
    },
  ],
};

export const bookProductId = (slug: BookSlug) => `app.quranlab.book.${slug}`;
/** course_purchase.product_type value for a web purchase of this book. */
export const bookPurchaseType = (slug: BookSlug) => `book_${slug}`;
export const isBookSlug = (v: unknown): v is BookSlug => typeof v === "string" && (BOOK_SLUGS as string[]).includes(v);

const s = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
const n = (v: unknown, fb: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : fb);

function mergeI18n(v: any, d: BookI18n): BookI18n {
  return {
    title: s(v?.title, d.title), subtitle: s(v?.subtitle, d.subtitle), description: s(v?.description, d.description),
    bullets: Array.isArray(v?.bullets) ? v.bullets.filter((x: unknown): x is string => typeof x === "string") : d.bullets,
    meta: s(v?.meta, d.meta),
  };
}

/** The book's copy in the given language (French = the base fields). */
export function localizeBook(book: Book, locale: "fr" | "en" | "es"): Book {
  if (locale === "fr") return book;
  return { ...book, ...book.i18n[locale] };
}

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
        i18n: { en: mergeI18n(sb.i18n?.en, db.i18n.en), es: mergeI18n(sb.i18n?.es, db.i18n.es) },
      };
    }),
  };
}
