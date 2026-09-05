/**
 * Client-safe content model for the editorial ebook landing
 * "Comprendre 85% du Coran en 30 jours" (/coran-30-jours). Same DA as the
 * Qalbanah reference: teal "smoky" hero + cream/pale sections, serif type, a
 * 3D book in the hero and a page-flip "feuilleter" section. Everything here is
 * admin-editable. No server-only/db imports → importable from the admin form.
 */

export type Ebook30Page = { image: string; caption: string };
export type Ebook30Col = { title: string; body: string };
export type Ebook30NavLink = { label: string; anchor: string };

export type Ebook30Content = {
  accentColor: string;

  brand: string;
  navLinks: Ebook30NavLink[];
  navCta: string;

  // Hero
  eyebrow: string;
  heroTitle: string;
  heroTitleItalic: string;
  price: { currency: "EUR" | "USD" | "GBP"; amountCents: number; compareAtCents: number };
  primaryCta: string;
  secondaryCta: string;
  heroText: string;
  heroSmall: string;
  coverImage: string;
  coverTitle: string;
  coverSubtitle: string;

  // Band
  bandItems: string[];

  // "Plus que des mots"
  aboutLabel: string;
  aboutTitle: string;
  aboutTitleItalic: string;
  aboutBody: string[];
  aboutLink: string;

  // Feuilleter
  flipLabel: string;
  flipTitle: string;
  flipTitleItalic: string;
  flipSubtext: string;
  flipLeftLabel: string;
  flipRightLabel: string;
  pages: Ebook30Page[];

  // 3 columns
  cols: Ebook30Col[];

  // Final CTA
  finalLabel: string;
  finalTitle: string;
  finalTitleItalic: string;
  finalText: string;
  finalCta: string;
  finalSmall: string;

  // Checkout
  checkoutBadge: string;
  guarantee: string;

  // Footer
  footerTagline: string;
  footerCopyright: string;
};

export const EBOOK30_KEY = "ebook30_content";

export const EBOOK30_DEFAULTS: Ebook30Content = {
  accentColor: "#3F7D92",

  brand: "QURANLAB",
  navLinks: [
    { label: "Le livre", anchor: "livre" },
    { label: "Les extraits", anchor: "extraits" },
    { label: "L'offre", anchor: "offre" },
  ],
  navCta: "Je commence",

  eyebrow: "COMPRENDRE LE CORAN, EN 30 JOURS",
  heroTitle: "Comprends le Coran.",
  heroTitleItalic: "En 30 jours.",
  price: { currency: "EUR", amountCents: 1499, compareAtCents: 3900 },
  primaryCta: "Je commence",
  secondaryCta: "Feuilleter un extrait",
  heroText:
    "Tu récites le Coran sans en comprendre les mots ? En 30 jours, apprends les 500 mots qui composent 85% du Coran et ressens enfin chaque verset.",
  heroSmall: "Ebook en français · Téléphone, tablette et ordinateur · Accès à vie",
  coverImage: "",
  coverTitle: "COMPRENDRE\n85% DU CORAN",
  coverSubtitle: "EN 30 JOURS",

  bandItems: ["Apprendre les mots essentiels", "Comprendre chaque verset", "Ancrer en 30 jours"],

  aboutLabel: "POUR TON CHEMINEMENT",
  aboutTitle: "Plus que réciter,",
  aboutTitleItalic: "comprendre.",
  aboutBody: [
    "Lire le Coran sans le comprendre, c'est passer à côté de sa lumière. En comprendre les mots donne une tout autre profondeur à ta lecture et à ta prière.",
    "La méthode des 30 jours te fait apprendre les 500 mots qui reviennent le plus souvent — 85% du Coran. Quelques minutes par jour, une page à la fois, à ton rythme.",
  ],
  aboutLink: "Découvrir les premières pages",

  flipLabel: "DÉCOUVRE L'INTÉRIEUR",
  flipTitle: "Prends le temps",
  flipTitleItalic: "de feuilleter.",
  flipSubtext: "Voici quelques pages du livre, pour découvrir la méthode avant de faire ton choix.",
  flipLeftLabel: "EXTRAITS DU LIVRE",
  flipRightLabel: "Fais glisser les pages",
  pages: [],

  cols: [
    {
      title: "Apprends les 500 mots",
      body: "Les mots qui composent 85% du Coran, expliqués simplement, du plus fréquent au plus rare.",
    },
    {
      title: "Comprends chaque verset",
      body: "Reconnais les mots dans ta lecture et ta prière, et ressens enfin ce que tu récites.",
    },
    {
      title: "En 30 jours seulement",
      body: "Un plan jour par jour, quelques minutes suffisent. À ton rythme, sans pression.",
    },
  ],

  finalLabel: "COMPRENDRE 85% DU CORAN",
  finalTitle: "Une méthode",
  finalTitleItalic: "en 30 jours.",
  finalText: "Un ebook à garder près de toi, pour apprendre et revenir à l'essentiel : comprendre le Coran.",
  finalCta: "Je commence mes 30 jours",
  finalSmall: "FORMAT NUMÉRIQUE · ACCÈS À VIE",

  checkoutBadge: "Accès à vie",
  guarantee: "Paiement sécurisé · Accès immédiat · Garantie 30 jours",

  footerTagline: "Apprendre, comprendre, ressentir.",
  footerCopyright: "© 2026 Quranlab",
};

const s = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
const arr = <T,>(v: unknown, fb: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fb);

export function mergeEbook30Content(stored: Partial<Ebook30Content> | null): Ebook30Content {
  const d = EBOOK30_DEFAULTS;
  if (!stored) return d;
  return {
    accentColor: s(stored.accentColor, d.accentColor),
    brand: s(stored.brand, d.brand),
    navLinks: arr(stored.navLinks, d.navLinks).map((l) => ({
      label: s(l?.label, ""),
      anchor: s(l?.anchor, ""),
    })),
    navCta: s(stored.navCta, d.navCta),
    eyebrow: s(stored.eyebrow, d.eyebrow),
    heroTitle: s(stored.heroTitle, d.heroTitle),
    heroTitleItalic: s(stored.heroTitleItalic, d.heroTitleItalic),
    price: {
      currency: (["EUR", "USD", "GBP"] as const).includes(stored.price?.currency as any)
        ? (stored.price!.currency as Ebook30Content["price"]["currency"])
        : d.price.currency,
      amountCents:
        typeof stored.price?.amountCents === "number" ? stored.price.amountCents : d.price.amountCents,
      compareAtCents:
        typeof stored.price?.compareAtCents === "number"
          ? stored.price.compareAtCents
          : d.price.compareAtCents,
    },
    primaryCta: s(stored.primaryCta, d.primaryCta),
    secondaryCta: s(stored.secondaryCta, d.secondaryCta),
    heroText: s(stored.heroText, d.heroText),
    heroSmall: s(stored.heroSmall, d.heroSmall),
    coverImage: s(stored.coverImage, d.coverImage),
    coverTitle: s(stored.coverTitle, d.coverTitle),
    coverSubtitle: s(stored.coverSubtitle, d.coverSubtitle),
    bandItems: arr(stored.bandItems, d.bandItems).map((x) => s(x, "")),
    aboutLabel: s(stored.aboutLabel, d.aboutLabel),
    aboutTitle: s(stored.aboutTitle, d.aboutTitle),
    aboutTitleItalic: s(stored.aboutTitleItalic, d.aboutTitleItalic),
    aboutBody: arr(stored.aboutBody, d.aboutBody).map((x) => s(x, "")),
    aboutLink: s(stored.aboutLink, d.aboutLink),
    flipLabel: s(stored.flipLabel, d.flipLabel),
    flipTitle: s(stored.flipTitle, d.flipTitle),
    flipTitleItalic: s(stored.flipTitleItalic, d.flipTitleItalic),
    flipSubtext: s(stored.flipSubtext, d.flipSubtext),
    flipLeftLabel: s(stored.flipLeftLabel, d.flipLeftLabel),
    flipRightLabel: s(stored.flipRightLabel, d.flipRightLabel),
    pages: arr(stored.pages, d.pages).map((p) => ({
      image: s(p?.image, ""),
      caption: s(p?.caption, ""),
    })),
    cols: arr(stored.cols, d.cols).map((c) => ({ title: s(c?.title, ""), body: s(c?.body, "") })),
    finalLabel: s(stored.finalLabel, d.finalLabel),
    finalTitle: s(stored.finalTitle, d.finalTitle),
    finalTitleItalic: s(stored.finalTitleItalic, d.finalTitleItalic),
    finalText: s(stored.finalText, d.finalText),
    finalCta: s(stored.finalCta, d.finalCta),
    finalSmall: s(stored.finalSmall, d.finalSmall),
    checkoutBadge: s(stored.checkoutBadge, d.checkoutBadge),
    guarantee: s(stored.guarantee, d.guarantee),
    footerTagline: s(stored.footerTagline, d.footerTagline),
    footerCopyright: s(stored.footerCopyright, d.footerCopyright),
  };
}
