/**
 * Client-safe content model for the /comprendre-sa-priere VSL landing.
 * Everything on that page is editable from the admin, so this holds the full
 * shape (nav, hero, "déclic", steps, value stack, reviews, FAQ, final CTA,
 * theme + per-section images). No server-only / db imports → importable from
 * the admin form (client). The DB getter lives in `priere-vsl-content.ts`.
 */

export type VslNavLink = { label: string; anchor: string };
export type VslStep = { badge: string; title: string; desc: string; image: string };
export type VslStackItem = { title: string; desc: string; value: string };
export type VslFaq = { q: string; a: string };
export type VslReview = { name: string; text: string };

export type PriereVslContent = {
  // Theme
  bgColor: string;
  accentColor: string;

  // Nav
  brand: string;
  navLinks: VslNavLink[];
  navCta: string;

  // Hero
  eyebrow: string;
  title: string;
  subtitle: string;
  badges: string[];
  heroImage: string;
  bullets: string[];
  heroCta: string;
  socialProof: string;
  avatars: string[];

  // Price (drives the value stack + checkout)
  price: { currency: "EUR" | "USD" | "GBP"; amountCents: number; compareAtCents: number };

  // "Déclic" — pourquoi si peu cher
  declicHeading: string;
  declicParagraphs: string[];
  declicAuthorName: string;
  declicAuthorRole: string;
  declicImage: string;

  // Comment ça marche
  stepsHeading: string;
  steps: VslStep[];
  stepsCta: string;

  // Value stack
  stackHeading: string;
  stackSubheading: string;
  stackItems: VslStackItem[];
  stackTotalLabel: string;
  stackTodayLabel: string;
  stackCta: string;
  guarantee: string;

  // Reviews
  reviewsHeading: string;
  reviews: VslReview[];

  // FAQ
  faqHeading: string;
  faq: VslFaq[];

  // Checkout
  checkoutBadge: string;

  // Final CTA
  finalHeading: string;
  finalSubtext: string;
  finalCta: string;
  finalFinePrint: string;

  // Footer
  footer: string;
};

export const PRIERE_VSL_KEY = "priere_vsl_content";

export const PRIERE_VSL_DEFAULTS: PriereVslContent = {
  bgColor: "#FAF8F3",
  accentColor: "#FF6A1A",

  brand: "Quranlab",
  navLinks: [
    { label: "Le déclic", anchor: "declic" },
    { label: "Comment ça marche", anchor: "etapes" },
    { label: "Ce que tu reçois", anchor: "inclus" },
    { label: "Avis", anchor: "avis" },
    { label: "FAQ", anchor: "faq" },
  ],
  navCta: "Commencer",

  eyebrow: "Accès à vie · Sans abonnement",
  title: "Tu pries 5 fois par jour… sans comprendre un seul mot ?",
  subtitle:
    "Apprends les 500 mots qui reviennent en boucle dans le Coran et ressens enfin ta prière au lieu de la réciter par cœur.",
  badges: ["Sans apprendre l'arabe", "5 min par jour", "Accès à vie"],
  heroImage: "",
  bullets: [
    "Les 500 mots essentiels du Coran",
    "Une méthode simple, quelques minutes par jour",
    "Accès Premium à vie à l'application",
  ],
  heroCta: "Je veux comprendre ma prière",
  socialProof: "Rejoins 1 500+ musulmans qui comprennent enfin leur prière",
  avatars: ["🧕", "🧔", "👳", "🧕🏽"],

  price: { currency: "EUR", amountCents: 999, compareAtCents: 4900 },

  declicHeading: "Attends — pourquoi seulement {price} ?",
  declicParagraphs: [
    "Je sais ce que tu penses : « comprendre le Coran, ça devrait coûter cher, ou prendre des années. » Laisse-moi être honnête avec toi.",
    "Notre but n'est pas de faire de l'argent sur un livre. C'est que le maximum de musulmans comprennent enfin ce qu'ils récitent.",
    "Alors on a rendu le prix ridicule exprès : une fois, à vie. Aucun abonnement, aucun piège.",
  ],
  declicAuthorName: "Mamadou",
  declicAuthorRole: "Fondateur de Quranlab",
  declicImage: "",

  stepsHeading: "Comment ça marche",
  steps: [
    {
      badge: "Étape 1",
      title: "Débloque les 500 mots",
      desc: "Le cœur du Coran, réuni au même endroit et expliqué simplement, du plus fréquent au plus rare.",
      image: "",
    },
    {
      badge: "Étape 2",
      title: "Apprends quelques minutes par jour",
      desc: "Une méthode de répétition simple qui ancre les mots sans effort. Aucune grammaire compliquée.",
      image: "",
    },
    {
      badge: "Étape 3",
      title: "Comprends enfin ta prière",
      desc: "Tu ne récites plus dans le vide : tu reconnais les mots, tu comprends, tu ressens.",
      image: "",
    },
  ],
  stepsCta: "Commencer maintenant",

  stackHeading: "Tout est inclus. À vie.",
  stackSubheading: "Tout ce dont tu as besoin pour comprendre ta prière, dans un seul accès.",
  stackItems: [
    {
      title: "Accès Premium à vie à l'app",
      desc: "Les 500 mots qui composent 85% du Coran, expliqués simplement.",
      value: "29 €",
    },
    { title: "Le guide des 500 mots (PDF)", desc: "À garder, imprimer et réviser où tu veux.", value: "15 €" },
    { title: "Mises à jour & nouveaux contenus", desc: "L'app s'enrichit — tu en profites, à vie.", value: "5 €" },
  ],
  stackTotalLabel: "Valeur totale",
  stackTodayLabel: "Ton prix aujourd'hui",
  stackCta: "Je débloque mon accès à vie",
  guarantee: "Paiement sécurisé · Garantie 30 jours",

  reviewsHeading: "Ils ressentent enfin leur prière",
  reviews: [
    {
      name: "Omar",
      text: "Je récitais sans rien comprendre depuis 15 ans. En quelques jours je reconnais des mots dans ma prière. Ça a tout changé. Allahumma barik.",
    },
    {
      name: "Nayah",
      text: "Enfin je SAIS ce que je dis quand je prie. La façon la plus simple que j'ai trouvée. Barak Allah fikoum.",
    },
    {
      name: "Yassine",
      text: "Quelques minutes par jour et Al-Fatiha a pris un tout autre sens. Je recommande à 100%.",
    },
  ],

  faqHeading: "Questions fréquentes",
  faq: [
    {
      q: "Faut-il connaître l'arabe ?",
      a: "Non, pas du tout. La méthode part de zéro : chaque mot est écrit en arabe, en phonétique et traduit en français. Tu apprends à reconnaître les mots, pas à parler arabe couramment.",
    },
    {
      q: "Combien de temps par jour ?",
      a: "Quelques minutes suffisent. La méthode est faite pour tenir dans un quotidien chargé — dans les transports, avant de dormir, après une prière.",
    },
    { q: "C'est un abonnement ?", a: "Non. C'est un paiement unique qui te donne un accès à vie, sans abonnement et sans frais cachés." },
    {
      q: "En combien de temps je vais voir la différence ?",
      a: "La plupart des gens reconnaissent leurs premiers mots dans leur prière dès les premiers jours. Plus tu avances, plus les passages s'éclairent.",
    },
    {
      q: "Et si ça ne me convient pas ?",
      a: "Tu es couvert par une garantie 30 jours : si tu n'es pas satisfait, tu es remboursé, sans avoir à te justifier.",
    },
    {
      q: "Comment je reçois mon accès ?",
      a: "Immédiatement après le paiement, par email. Tu crées ton compte avec le même email et ton accès Premium à vie est débloqué.",
    },
  ],

  checkoutBadge: "Accès à vie",

  finalHeading: "Ton accès à vie est à un clic",
  finalSubtext:
    "Les 500 mots, l'app, le guide PDF — pour comprendre enfin ce que tu récites. Un seul paiement, sans abonnement.",
  finalCta: "Je veux comprendre ma prière",
  finalFinePrint: "Accès immédiat · Garantie 30 jours",

  footer: "Quranlab · comprends le Coran",
};

const s = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
const arr = <T,>(v: unknown, fb: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fb);

export function mergePriereVslContent(
  stored: Partial<PriereVslContent> | null,
): PriereVslContent {
  const d = PRIERE_VSL_DEFAULTS;
  if (!stored) return d;
  return {
    bgColor: s(stored.bgColor, d.bgColor),
    accentColor: s(stored.accentColor, d.accentColor),
    brand: s(stored.brand, d.brand),
    navLinks: arr(stored.navLinks, d.navLinks).map((l) => ({
      label: s(l?.label, ""),
      anchor: s(l?.anchor, ""),
    })),
    navCta: s(stored.navCta, d.navCta),
    eyebrow: s(stored.eyebrow, d.eyebrow),
    title: s(stored.title, d.title),
    subtitle: s(stored.subtitle, d.subtitle),
    badges: arr(stored.badges, d.badges).map((b) => s(b, "")),
    heroImage: s(stored.heroImage, d.heroImage),
    bullets: arr(stored.bullets, d.bullets).map((b) => s(b, "")),
    heroCta: s(stored.heroCta, d.heroCta),
    socialProof: s(stored.socialProof, d.socialProof),
    avatars: arr(stored.avatars, d.avatars).map((a) => s(a, "")),
    price: {
      currency: (["EUR", "USD", "GBP"] as const).includes(stored.price?.currency as any)
        ? (stored.price!.currency as PriereVslContent["price"]["currency"])
        : d.price.currency,
      amountCents:
        typeof stored.price?.amountCents === "number" ? stored.price.amountCents : d.price.amountCents,
      compareAtCents:
        typeof stored.price?.compareAtCents === "number"
          ? stored.price.compareAtCents
          : d.price.compareAtCents,
    },
    declicHeading: s(stored.declicHeading, d.declicHeading),
    declicParagraphs: arr(stored.declicParagraphs, d.declicParagraphs).map((p) => s(p, "")),
    declicAuthorName: s(stored.declicAuthorName, d.declicAuthorName),
    declicAuthorRole: s(stored.declicAuthorRole, d.declicAuthorRole),
    declicImage: s(stored.declicImage, d.declicImage),
    stepsHeading: s(stored.stepsHeading, d.stepsHeading),
    steps: arr(stored.steps, d.steps).map((st) => ({
      badge: s(st?.badge, ""),
      title: s(st?.title, ""),
      desc: s(st?.desc, ""),
      image: s(st?.image, ""),
    })),
    stepsCta: s(stored.stepsCta, d.stepsCta),
    stackHeading: s(stored.stackHeading, d.stackHeading),
    stackSubheading: s(stored.stackSubheading, d.stackSubheading),
    stackItems: arr(stored.stackItems, d.stackItems).map((it) => ({
      title: s(it?.title, ""),
      desc: s(it?.desc, ""),
      value: s(it?.value, ""),
    })),
    stackTotalLabel: s(stored.stackTotalLabel, d.stackTotalLabel),
    stackTodayLabel: s(stored.stackTodayLabel, d.stackTodayLabel),
    stackCta: s(stored.stackCta, d.stackCta),
    guarantee: s(stored.guarantee, d.guarantee),
    reviewsHeading: s(stored.reviewsHeading, d.reviewsHeading),
    reviews: arr(stored.reviews, d.reviews).map((r) => ({
      name: s(r?.name, ""),
      text: s(r?.text, ""),
    })),
    faqHeading: s(stored.faqHeading, d.faqHeading),
    faq: arr(stored.faq, d.faq).map((f) => ({ q: s(f?.q, ""), a: s(f?.a, "") })),
    checkoutBadge: s(stored.checkoutBadge, d.checkoutBadge),
    finalHeading: s(stored.finalHeading, d.finalHeading),
    finalSubtext: s(stored.finalSubtext, d.finalSubtext),
    finalCta: s(stored.finalCta, d.finalCta),
    finalFinePrint: s(stored.finalFinePrint, d.finalFinePrint),
    footer: s(stored.footer, d.footer),
  };
}
