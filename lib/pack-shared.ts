/**
 * Client-safe content model for the high-ticket one-time offer page
 * /pack-coran : the PDF guide + bonuses (delivered by email with an access
 * link), 47 € lifetime, no subscription. Everything is admin-editable.
 * No server-only/db imports → importable from the admin form.
 */

export type PackBonus = { title: string; desc: string; value: string; icon: string };
export type PackStep = { title: string; desc: string };
export type PackReview = { name: string; meta: string; text: string; avatar: string };
export type PackFaq = { q: string; a: string };
export type PackPage = { image: string; caption: string };
export type PackBeforeAfter = { before: string; after: string };

export type PackContent = {
  accentColor: string;

  // Top urgency bar
  topBar: string;

  // Hero
  eyebrow: string;
  heroTitle: string;
  heroTitleItalic: string;
  heroText: string;
  price: { currency: "EUR" | "USD" | "GBP"; amountCents: number; compareAtCents: number };
  priceNote: string;
  primaryCta: string;
  ctaSub: string;
  trust: string[];
  ratingLabel: string;
  coverImage: string;
  coverTitle: string;
  coverSubtitle: string;

  // Pain
  painTitle: string;
  painItems: string[];
  painClose: string;

  // Before / after
  transfoTitle: string;
  transfo: PackBeforeAfter[];

  // Stack
  stackLabel: string;
  stackTitle: string;
  mainTitle: string;
  mainDesc: string;
  mainValue: string;
  mainBullets: string[];
  bonuses: PackBonus[];
  totalLabel: string;
  totalValue: string;
  todayLabel: string;

  // Steps
  stepsTitle: string;
  steps: PackStep[];

  // Preview
  previewTitle: string;
  pages: PackPage[];

  // Reviews
  reviewsTitle: string;
  reviews: PackReview[];

  // Guarantee
  guaranteeTitle: string;
  guaranteeText: string;

  // FAQ
  faqTitle: string;
  faq: PackFaq[];

  // Checkout
  checkoutTitle: string;
  checkoutBullets: string[];
  checkoutSmall: string;
  stickyText: string;

  footer: string;
};

export const PACK_KEY = "pack_coran_content";

export const PACK_DEFAULTS: PackContent = {
  accentColor: "#0E7C5B",

  topBar: "Offre de lancement — **47 €** au lieu de 97 € · Paiement unique · Accès à vie",

  eyebrow: "Guide PDF + 4 bonus · Sans abonnement",
  heroTitle: "Comprends enfin ce que tu récites,",
  heroTitleItalic: "mot après mot.",
  heroText:
    "Le guide des 500 mots qui composent 85 % du Coran, avec les bonus pour les mémoriser sans effort. Tu reçois ton lien d'accès par email dans la minute.",
  price: { currency: "EUR", amountCents: 4700, compareAtCents: 9700 },
  priceNote: "Paiement unique · Accès à vie · Aucun abonnement",
  primaryCta: "Je reçois mon pack maintenant",
  ctaSub: "Accès immédiat par email · Garantie 30 jours satisfait ou remboursé",
  trust: ["Paiement sécurisé", "Accès immédiat", "Garantie 30 jours"],
  ratingLabel: "4,9/5 · plus de 1 200 lecteurs",
  coverImage: "",
  coverTitle: "Comprendre 85 % du Coran",
  coverSubtitle: "Les 500 mots essentiels",

  painTitle: "Tu connais ce sentiment ?",
  painItems: [
    "Tu pries chaque jour… mais les mots glissent sans que tu en saisisses le sens.",
    "Tu as essayé l'arabe « classique » : grammaire, conjugaison, abandon au bout de 3 semaines.",
    "Tu veux pleurer en écoutant le Coran comme ceux qui le comprennent — pas seulement l'écouter.",
  ],
  painClose:
    "La bonne nouvelle : tu n'as pas besoin d'apprendre tout l'arabe. 500 mots reviennent sans cesse et couvrent 85 % du texte. C'est exactement ce que contient ce pack.",

  transfoTitle: "Ce qui change avec le pack",
  transfo: [
    { before: "Tu récites des sons", after: "Tu comprends des phrases" },
    { before: "La prière est une routine", after: "La prière devient une conversation" },
    { before: "Tu dépends de la traduction", after: "Tu reconnais les mots en direct" },
    { before: "Des mois d'arabe sans résultat", after: "Des progrès dès la première semaine" },
  ],

  stackLabel: "Tout ce que tu reçois",
  stackTitle: "Le pack complet, livré par email",
  mainTitle: "Le guide PDF « Comprendre 85 % du Coran »",
  mainDesc:
    "Les 500 mots essentiels classés par fréquence et par thème, avec leur sens, leur racine et un verset d'exemple pour chacun.",
  mainValue: "Valeur 47 €",
  mainBullets: [
    "500 mots = 85 % du Coran, classés par ordre d'apparition",
    "Un verset d'exemple par mot pour l'ancrer en contexte",
    "Format PDF lisible sur téléphone, tablette et ordinateur",
    "Mises à jour à vie incluses",
  ],
  bonuses: [
    {
      title: "Bonus 1 — Planning 30 jours",
      desc: "Le programme jour par jour pour maîtriser les 500 mots en un mois, 10 minutes par jour.",
      value: "Valeur 19 €",
      icon: "calendar",
    },
    {
      title: "Bonus 2 — Fiches de révision par sourate",
      desc: "Les mots clés des sourates les plus récitées (Al-Fatiha, Al-Ikhlas, Al-Falaq, An-Nas…) prêts à réviser avant la prière.",
      value: "Valeur 29 €",
      icon: "book",
    },
    {
      title: "Bonus 3 — Audio de prononciation",
      desc: "Chaque mot prononcé par un récitateur pour l'entendre juste, et le reconnaître à l'oreille.",
      value: "Valeur 24 €",
      icon: "audio",
    },
    {
      title: "Bonus 4 — Accès à vie à l'application Quranlab",
      desc: "Les exercices interactifs (QCM, anagrammes, répétition espacée) pour mémoriser les mots sans effort, sans abonnement.",
      value: "Valeur 99 €",
      icon: "app",
    },
  ],
  totalLabel: "Valeur totale",
  totalValue: "218 €",
  todayLabel: "Aujourd'hui",

  stepsTitle: "Comment ça marche",
  steps: [
    { title: "Tu commandes en 1 minute", desc: "Paiement sécurisé par carte, Apple Pay ou Google Pay." },
    { title: "Tu reçois ton lien d'accès", desc: "Un email arrive immédiatement avec le guide, les bonus et ton accès." },
    { title: "Tu commences aujourd'hui", desc: "10 minutes par jour. Dès la première semaine, tu reconnais des mots dans ta prière." },
  ],

  previewTitle: "Un aperçu de l'intérieur",
  pages: [],

  reviewsTitle: "Ils ont franchi le pas",
  reviews: [
    {
      name: "Omar",
      meta: "Paris · a pris le pack il y a 2 mois",
      text: "Je voulais juste tester… en 3 jours je reconnaissais plein de mots dans ma prière. Allahumma barik.",
      avatar: "",
    },
    {
      name: "Nayah",
      meta: "Lyon",
      text: "La façon la plus simple d'enfin comprendre. J'ai pleuré pendant Al-Fatiha pour la première fois.",
      avatar: "",
    },
    {
      name: "Idriss",
      meta: "Bruxelles",
      text: "J'avais abandonné l'arabe deux fois. Là, 10 minutes par jour et ça rentre. Le planning 30 jours fait toute la différence.",
      avatar: "",
    },
  ],

  guaranteeTitle: "Garantie 30 jours, zéro risque",
  guaranteeText:
    "Télécharge le pack, suis le planning. Si au bout de 30 jours tu ne reconnais pas plus de mots dans ta prière, un simple email et tu es remboursé intégralement. Tu gardes le guide.",

  faqTitle: "Questions fréquentes",
  faq: [
    { q: "Est-ce un abonnement ?", a: "Non. Un seul paiement de 47 €, et le pack est à toi à vie, mises à jour comprises." },
    { q: "Comment je reçois le pack ?", a: "Par email, immédiatement après le paiement : un lien d'accès vers le guide PDF et tous les bonus." },
    { q: "Je ne sais pas lire l'arabe, est-ce pour moi ?", a: "Oui. Chaque mot est écrit en arabe, en phonétique et traduit. L'audio du bonus 3 t'aide à l'oreille." },
    { q: "Combien de temps par jour ?", a: "10 minutes suffisent avec le planning 30 jours. La répétition fait le reste." },
    { q: "Et si ça ne me convient pas ?", a: "Garantie 30 jours satisfait ou remboursé, sans justification." },
  ],

  checkoutTitle: "Reçois ton pack maintenant",
  checkoutBullets: [
    "Le guide PDF des 500 mots (85 % du Coran)",
    "Les 4 bonus : planning, fiches, audio, application à vie",
    "Lien d'accès envoyé par email immédiatement",
    "Garantie 30 jours satisfait ou remboursé",
  ],
  checkoutSmall: "Paiement sécurisé par Stripe · Carte, Apple Pay, Google Pay",
  stickyText: "Pack complet · Accès à vie",

  footer: "© Quranlab · Paiement sécurisé · Aucun abonnement",
};

const s = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
const arr = <T,>(v: unknown, fb: T[], map: (x: any) => T | null): T[] =>
  Array.isArray(v) ? v.map(map).filter((x): x is T => x !== null) : fb;
const strs = (v: unknown, fb: string[]) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : fb;

/** Merges stored JSON over the defaults, tolerating missing/invalid fields. */
export function mergePackContent(stored: Partial<PackContent> | null): PackContent {
  const d = PACK_DEFAULTS;
  if (!stored) return d;
  const cur = (["EUR", "USD", "GBP"] as const).includes(stored.price?.currency as any)
    ? stored.price!.currency
    : d.price.currency;
  const n = (v: unknown, fb: number) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : fb;
  return {
    accentColor: /^#[0-9a-fA-F]{3,8}$/.test(s(stored.accentColor, "")) ? stored.accentColor! : d.accentColor,
    topBar: s(stored.topBar, d.topBar),
    eyebrow: s(stored.eyebrow, d.eyebrow),
    heroTitle: s(stored.heroTitle, d.heroTitle),
    heroTitleItalic: s(stored.heroTitleItalic, d.heroTitleItalic),
    heroText: s(stored.heroText, d.heroText),
    price: {
      currency: cur,
      amountCents: n(stored.price?.amountCents, d.price.amountCents),
      compareAtCents: n(stored.price?.compareAtCents, d.price.compareAtCents),
    },
    priceNote: s(stored.priceNote, d.priceNote),
    primaryCta: s(stored.primaryCta, d.primaryCta),
    ctaSub: s(stored.ctaSub, d.ctaSub),
    trust: strs(stored.trust, d.trust),
    ratingLabel: s(stored.ratingLabel, d.ratingLabel),
    coverImage: s(stored.coverImage, d.coverImage),
    coverTitle: s(stored.coverTitle, d.coverTitle),
    coverSubtitle: s(stored.coverSubtitle, d.coverSubtitle),
    painTitle: s(stored.painTitle, d.painTitle),
    painItems: strs(stored.painItems, d.painItems),
    painClose: s(stored.painClose, d.painClose),
    transfoTitle: s(stored.transfoTitle, d.transfoTitle),
    transfo: arr(stored.transfo, d.transfo, (x) =>
      x && typeof x.before === "string" ? { before: x.before, after: s(x.after, "") } : null,
    ),
    stackLabel: s(stored.stackLabel, d.stackLabel),
    stackTitle: s(stored.stackTitle, d.stackTitle),
    mainTitle: s(stored.mainTitle, d.mainTitle),
    mainDesc: s(stored.mainDesc, d.mainDesc),
    mainValue: s(stored.mainValue, d.mainValue),
    mainBullets: strs(stored.mainBullets, d.mainBullets),
    bonuses: arr(stored.bonuses, d.bonuses, (x) =>
      x && typeof x.title === "string"
        ? { title: x.title, desc: s(x.desc, ""), value: s(x.value, ""), icon: s(x.icon, "gift") }
        : null,
    ),
    totalLabel: s(stored.totalLabel, d.totalLabel),
    totalValue: s(stored.totalValue, d.totalValue),
    todayLabel: s(stored.todayLabel, d.todayLabel),
    stepsTitle: s(stored.stepsTitle, d.stepsTitle),
    steps: arr(stored.steps, d.steps, (x) =>
      x && typeof x.title === "string" ? { title: x.title, desc: s(x.desc, "") } : null,
    ),
    previewTitle: s(stored.previewTitle, d.previewTitle),
    pages: arr(stored.pages, d.pages, (x) =>
      x && typeof x.image === "string" && x.image ? { image: x.image, caption: s(x.caption, "") } : null,
    ),
    reviewsTitle: s(stored.reviewsTitle, d.reviewsTitle),
    reviews: arr(stored.reviews, d.reviews, (x) =>
      x && typeof x.text === "string"
        ? { name: s(x.name, ""), meta: s(x.meta, ""), text: x.text, avatar: s(x.avatar, "") }
        : null,
    ),
    guaranteeTitle: s(stored.guaranteeTitle, d.guaranteeTitle),
    guaranteeText: s(stored.guaranteeText, d.guaranteeText),
    faqTitle: s(stored.faqTitle, d.faqTitle),
    faq: arr(stored.faq, d.faq, (x) =>
      x && typeof x.q === "string" ? { q: x.q, a: s(x.a, "") } : null,
    ),
    checkoutTitle: s(stored.checkoutTitle, d.checkoutTitle),
    checkoutBullets: strs(stored.checkoutBullets, d.checkoutBullets),
    checkoutSmall: s(stored.checkoutSmall, d.checkoutSmall),
    stickyText: s(stored.stickyText, d.stickyText),
    footer: s(stored.footer, d.footer),
  };
}
