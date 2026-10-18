/**
 * Content model for the /commencer onboarding funnel (Takallam-style flow
 * adapted to Quranlab, in the Quranlab app DA: white, purple, Koji mascot).
 * Every screen, option, caption, plan and price is admin-editable.
 * Client-safe: no server imports.
 */

/** Icon keys rendered as monochrome SVG line icons (lucide). No emoji. */
export const ICON_KEYS = [
  "heart", "book-open", "book", "bookmark", "moon", "moon-star", "sparkles", "users", "baby", "hands", "hand",
  "message", "more", "plus", "clock", "timer", "hourglass", "calendar", "calendar-check", "sun", "sunrise", "sunset", "coffee",
  "target", "wrench", "puzzle", "layers", "zap", "repeat", "graduation", "landmark", "flag", "smile", "star", "check",
  "signal-0", "signal-1", "signal-2", "signal-3", "signal-4", "thumbs-up", "thumbs-down", "mail", "laptop",
  "unlock", "bell", "credit-card", "instagram", "youtube", "music", "ghost", "shield",
] as const;
export type IconKey = (typeof ICON_KEYS)[number];

export type CmOption = { id: string; label: string; icon?: string };
export type CmTimeOption = { minutes: number; label: string; weeks: number };
export type CmReview = { initials: string; name: string; text: string };
export type CmRow = { label: string; text: string; icon?: string };
export type CmTimelineItem = { title: string; text: string; icon?: string };
/** One interactive lesson card: the learner picks the right meaning. */
export type CmLessonCard = { arabic: string; translit: string; fr: string; choices: string[] };

export type CmStep =
  | { type: "splash"; arabic: string; brand: string; tagline: string }
  | { type: "welcome"; headline: string; tagline: string; cta: string; signinText: string; signinCta: string }
  | { type: "question"; id: string; headline: string; sub?: string; multi: boolean; options: CmOption[]; cta?: string }
  | { type: "chart"; headline: string; chartLabel: string; brandLabel: string; othersLabel: string; xStart: string; xEnd: string; checkTitle: string; checklist: string[]; cta?: string }
  | { type: "time"; headline: string; goalLabel: string; aloneLabel: string; xStart: string; xEnd: string; placeholder: string; sentence: string; options: CmTimeOption[]; cta?: string }
  | { type: "email"; headline: string; sub: string; placeholder: string; cta: string; note: string; skip?: string }
  | { type: "social"; headline: string; rating: string; ratingSub: string; sub: string; reviews: CmReview[]; cta?: string; lockSeconds: number }
  | { type: "loader"; headline: string; captions: string[]; durationMs: number }
  | { type: "plan"; headline: string; journeyTitle: string; levelPill: string; yourPlanLabel: string; minutesLabel: string; dateLabel: string; rows: CmRow[]; cta: string }
  | { type: "lesson"; headline: string; sub: string; cards: CmLessonCard[]; doneHeadline: string; doneSub: string; cta: string }
  | { type: "trial"; headline: string; cta: string; screenshots: string[] }
  | { type: "bell"; headline: string; cta: string };

/** Lifetime one-time offer shown on the paywall (no trial, no subscription). */
export type CmPaywall = {
  badge: string;
  title: string;
  subtitle: string;
  perks: CmTimelineItem[];
  amountCents: number;
  priceLabel: string;
  compareLabel: string;
  priceNote: string;
  urgency: string;
  reassurance: string;
  cta: string;
  finePrint: string;
  guaranteeTitle: string;
  guaranteeText: string;
};

export type CommencerContent = {
  accentColor: string;
  steps: CmStep[];
  paywall: CmPaywall;
  merci: { title: string; text: string; cta: string; sourceHeadline: string; sourceOptions: CmOption[] };
  /** One-time upsell shown on the thank-you page (Arabic reading course). */
  upsell: CmUpsell;
};

export type CmUpsell = {
  enabled: boolean;
  badge: string;
  title: string;
  text: string;
  bullets: string[];
  amountCents: number;
  priceLabel: string;
  compareLabel: string;
  cta: string;
  decline: string;
  note: string;
  doneTitle: string;
  doneText: string;
  /** Ebook upsells ({title} / {price} placeholders). */
  bookBadge: string;
  bookTitle: string;
  bookCta: string;
  bookDecline: string;
  bookNote: string;
  bookDoneSuffix: string;
  bookDoneText: string;
};

export const COMMENCER_KEY = "commencer_content";

export const COMMENCER_DEFAULTS: CommencerContent = {
  accentColor: "#6967FB",
  steps: [
    { type: "splash", arabic: "قُرْآن", brand: "QURANLAB", tagline: "COMPRENDS LE CORAN" },
    { type: "welcome", headline: "Salam alaykoum, je suis Koji !", tagline: "Comprends le Coran.\n**Enfin.**", cta: "Continuer", signinText: "Déjà un compte ?", signinCta: "Se connecter" },
    { type: "question", id: "why", headline: "Pourquoi veux-tu comprendre le Coran ?", sub: "Plusieurs choix possibles", multi: true, options: [
      { id: "prayer", label: "Ressentir ma prière", icon: "hands" },
      { id: "recite", label: "Comprendre ce que je récite", icon: "book-open" },
      { id: "closer", label: "Me rapprocher d'Allah", icon: "moon-star" },
      { id: "read", label: "Lire le Coran sans traduction", icon: "sparkles" },
      { id: "kids", label: "Le transmettre à mes enfants", icon: "baby" },
      { id: "other", label: "Autre", icon: "more" },
    ] },
    { type: "question", id: "pain", headline: "Ne pas comprendre, ça change quoi au quotidien ?", sub: "Plusieurs choix possibles", multi: true, options: [
      { id: "empty", label: "Je récite sans ressentir", icon: "heart" },
      { id: "demot", label: "Je me démotive à lire le Coran", icon: "book" },
      { id: "memo", label: "J'ai du mal à mémoriser des sourates", icon: "bookmark" },
      { id: "far", label: "Je me sens loin de ma foi", icon: "moon" },
      { id: "talk", label: "Je n'ose pas participer aux discussions", icon: "message" },
    ] },
    { type: "chart", headline: "Conçu pour te rapprocher du Coran", chartLabel: "Ta progression", brandLabel: "Quranlab", othersLabel: "Autres méthodes", xStart: "Mois 0", xEnd: "Mois 1", checkTitle: "Quranlab va t'aider à", checklist: [
      "Comprendre ce que tu dis en salat",
      "Reconnaître les 500 mots = 85% du Coran",
      "Retenir grâce à des révisions intelligentes",
      "Avancer quelques minutes par jour",
    ] },
    { type: "question", id: "gender", headline: "Pour calibrer ton plan", sub: "Cette réponse sert à personnaliser ton parcours.", multi: false, options: [ { id: "m", label: "Homme" }, { id: "f", label: "Femme" } ] },
    { type: "question", id: "level", headline: "Ton niveau en arabe coranique ?", sub: "Quranlab adapte les leçons à ton niveau.", multi: false, options: [
      { id: "l1", label: "Je débute totalement", icon: "signal-0" }, { id: "l2", label: "Je connais quelques mots", icon: "signal-1" }, { id: "l3", label: "Je reconnais des mots dans les sourates", icon: "signal-2" },
      { id: "l4", label: "Je comprends des versets simples", icon: "signal-3" }, { id: "l5", label: "Je comprends la plupart des versets", icon: "signal-4" },
    ] },
    { type: "question", id: "alphabet", headline: "Sais-tu lire l'arabe ?", multi: false, options: [ { id: "yes", label: "Oui, je lis l'arabe", icon: "thumbs-up" }, { id: "no", label: "Pas encore (je lis en phonétique)", icon: "thumbs-down" } ] },
    { type: "question", id: "blockers", headline: "Qu'est-ce qui t'a freiné par le passé ?", sub: "Plusieurs choix possibles", multi: true, options: [
      { id: "time", label: "Pas assez de temps", icon: "clock" }, { id: "method", label: "Aucune méthode / structure", icon: "layers" }, { id: "busy", label: "Trop occupé (travail / école)", icon: "laptop" },
      { id: "consist", label: "Manque de régularité", icon: "repeat" }, { id: "hard", label: "L'arabe me semblait trop dur", icon: "puzzle" }, { id: "other", label: "Autre", icon: "plus" },
    ] },
    { type: "question", id: "when", headline: "Quand veux-tu pratiquer ?", sub: "On t'enverra ton rappel au bon moment.", multi: false, options: [
      { id: "morning", label: "Le matin", icon: "sunrise" }, { id: "prayer", label: "Après une prière", icon: "moon-star" }, { id: "evening", label: "Le soir", icon: "sunset" }, { id: "any", label: "Quand j'ai un moment", icon: "coffee" },
    ] },
    { type: "time", headline: "Combien de temps par jour ?", goalLabel: "Ton objectif", aloneLabel: "Seul(e)", xStart: "Maintenant", xEnd: "3 mois", placeholder: "Choisis une durée pour voir quand tu comprendras 85% du Coran.", sentence: "À {min} min par jour, tu comprendras 85% du Coran **en {weeks} semaines**.", options: [
      { minutes: 5, label: "5 min", weeks: 10 }, { minutes: 15, label: "15 min", weeks: 8 }, { minutes: 30, label: "30 min", weeks: 6 }, { minutes: 45, label: "45 min+", weeks: 5 },
    ] },
    { type: "social", headline: "Ils comprennent enfin leur prière", rating: "4,9", ratingSub: "Plus de 1 500 apprenants", sub: "Quranlab a été conçu pour des gens comme toi", reviews: [
      { initials: "OM", name: "Omar", text: "Je récitais sans rien comprendre depuis 15 ans. En quelques jours je reconnais des mots dans ma prière. Ça a tout changé." },
      { initials: "NA", name: "Nayah", text: "Enfin je SAIS ce que je dis quand je prie. La façon la plus simple que j'ai trouvée. Barak Allah fikoum." },
      { initials: "YA", name: "Yassine", text: "Quelques minutes par jour et Al-Fatiha a pris un tout autre sens. Je recommande à 100 %." },
    ], lockSeconds: 2.5 },
    { type: "loader", headline: "Création de ton plan personnalisé", captions: ["Optimisation pour l'arabe coranique…", "Calibrage à ton niveau…", "Préparation de tes premières leçons…"], durationMs: 7000 },
    { type: "plan", headline: "Ton plan personnalisé est prêt", journeyTitle: "Parcours Coran", levelPill: "Niveau {level} · {levelLabel}", yourPlanLabel: "TON PLAN", minutesLabel: "par jour", dateLabel: "ton objectif", rows: [
      { icon: "target", label: "Objectif", text: "Comprendre chaque mot de ta prière" },
      { icon: "wrench", label: "Ce qu'on corrige", text: "Des leçons de {min} min qui tiennent dans ta journée" },
      { icon: "bell", label: "Ton rappel", text: "{when}" },
      { icon: "layers", label: "Focus", text: "Vocabulaire · Versets · Prière" },
    ], cta: "Commencer mon plan" },
    { type: "email", headline: "Reçois ton plan personnalisé par email", sub: "On t'enverra aussi ton rappel {when}, pour tenir ta routine.", placeholder: "ton@email.com", cta: "Recevoir mon plan", note: "Pas de spam · désabonnement en 1 clic", skip: "Passer" },
    { type: "lesson", headline: "Ta première leçon, maintenant", sub: "Trois mots que tu récites déjà. Trouve leur sens.", cards: [
      { arabic: "رَبِّ", translit: "Rabb", fr: "Seigneur", choices: ["Seigneur", "Lumière", "Chemin"] },
      { arabic: "ٱلرَّحِيمِ", translit: "ar-Rahîm", fr: "Le Très Miséricordieux", choices: ["Le Tout-Puissant", "Le Très Miséricordieux", "Le Créateur"] },
      { arabic: "ٱلْحَمْدُ", translit: "al-hamd", fr: "La louange", choices: ["La prière", "La louange", "Le pardon"] },
    ], doneHeadline: "Tu viens de comprendre 3 mots du Coran", doneSub: "Il en reste 497. Continue sur ta lancée.", cta: "Continuer" },
  ],
  paywall: {
    badge: "Offre de lancement · Accès à vie",
    title: "Débloque **tout Quranlab** pour le prix d'un café",
    subtitle: "Un seul paiement. Aucun abonnement. Accès à vie.",
    perks: [
      { icon: "unlock", title: "Les 500 mots = 85 % du Coran", text: "Toutes les leçons, tous les niveaux, débloqués immédiatement." },
      { icon: "target", title: "Ton plan personnalisé", text: "Le parcours qu'on vient de construire ensemble, prêt à démarrer." },
      { icon: "layers", title: "Exercices illimités", text: "QCM, anagrammes, répétition espacée : tu mémorises sans effort." },
      { icon: "bell", title: "Ton rappel quotidien", text: "Le petit coup de pouce {when} pour tenir ta routine." },
    ],
    amountCents: 999,
    priceLabel: "9,99 €",
    compareLabel: "49 €",
    priceNote: "une seule fois · à vie",
    urgency: "Prix de lancement réservé aux nouveaux apprenants. Il passera à 49 € prochainement.",
    reassurance: "Paiement sécurisé · Accès immédiat · Garantie 30 jours",
    cta: "Débloquer l'accès à vie — 9,99 €",
    finePrint: "Paiement unique de 9,99 €. Aucun renouvellement, aucun abonnement. Satisfait ou remboursé 30 jours.",
    guaranteeTitle: "Garantie 30 jours",
    guaranteeText: "Si tu ne reconnais pas plus de mots dans ta prière d'ici 30 jours, un email suffit et tu es remboursé.",
  },
  merci: {
    title: "Ton accès à vie est activé, barak Allah fik !",
    text: "Un email vient de t'être envoyé pour **créer ton compte** et démarrer ton plan. Pense à vérifier tes spams.",
    cta: "Créer mon compte",
    sourceHeadline: "Une dernière chose : où as-tu entendu parler de nous ?",
    sourceOptions: [
      { id: "instagram", label: "Instagram", icon: "instagram" }, { id: "tiktok", label: "TikTok", icon: "music" }, { id: "youtube", label: "YouTube", icon: "youtube" },
      { id: "snapchat", label: "Snapchat", icon: "ghost" }, { id: "friend", label: "Un proche", icon: "users" }, { id: "mosque", label: "Mosquée / communauté", icon: "landmark" }, { id: "other", label: "Autre", icon: "more" },
    ],
  },
  upsell: {
    enabled: true,
    badge: "Offre unique · réservée aux nouveaux membres",
    title: "Et si tu apprenais aussi à **lire l'arabe** en moins de 7h ?",
    text: "Comprendre les mots, c'est la première étape. Les lire directement dans le Coran, c'est la liberté totale. 21 vidéos courtes, sans grammaire, sans devoirs.",
    bullets: ["21 cours vidéo, de l'alphabet à la lecture fluide", "Méthode sans grammaire ni cahier, 20 min par jour", "Accès à vie, dans ton espace Quranlab"],
    amountCents: 2700,
    priceLabel: "27 €",
    compareLabel: "97 €",
    cta: "Oui, j'ajoute le cours d'arabe pour 27 €",
    decline: "Non merci, je continue sans",
    note: "Cette offre n'apparaît qu'une fois, sur cette page. Paiement unique, garantie 30 jours.",
    doneTitle: "Le cours d'arabe est ajouté à ton compte",
    doneText: "Tu le retrouveras dans « Ma formation » dès que ton compte est créé avec la même adresse email.",
    bookBadge: "Offre membre · une seule fois",
    bookTitle: "Ajoute le livre **{title}** à ta bibliothèque",
    bookCta: "Oui, j'ajoute ce livre pour {price}",
    bookDecline: "Non merci",
    bookNote: "Paiement unique. Lecture dans l'app, à vie.",
    bookDoneSuffix: "est dans ta bibliothèque",
    bookDoneText: "Ouvre-le depuis la Boutique de l'app dès que ton compte est créé avec la même adresse email.",
  },
};

const s = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
const n = (v: unknown, fb: number) => (typeof v === "number" && Number.isFinite(v) ? v : fb);
const arr = <T,>(v: unknown, fb: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fb);
const strs = (v: unknown, fb: string[]) => arr<unknown>(v, fb).map((x) => s(x, "")).filter(Boolean);
const opts = (v: unknown): CmOption[] =>
  arr<any>(v, []).map((o) => ({ id: s(o?.id, ""), label: s(o?.label, ""), icon: s(o?.icon, "") || undefined })).filter((o) => o.id && o.label);

function mergeStep(st: any): CmStep | null {
  if (!st || typeof st.type !== "string") return null;
  switch (st.type as CmStep["type"]) {
    case "splash": return { type: "splash", arabic: s(st.arabic, "قُرْآن"), brand: s(st.brand, "QURANLAB"), tagline: s(st.tagline, "") };
    case "welcome": return { type: "welcome", headline: s(st.headline, ""), tagline: s(st.tagline, ""), cta: s(st.cta, "Continuer"), signinText: s(st.signinText, ""), signinCta: s(st.signinCta, "") };
    case "question": return { type: "question", id: s(st.id, "q"), headline: s(st.headline, ""), sub: s(st.sub, "") || undefined, multi: st.multi === true, cta: s(st.cta, "") || undefined, options: opts(st.options) };
    case "chart": return { type: "chart", headline: s(st.headline, ""), chartLabel: s(st.chartLabel, ""), brandLabel: s(st.brandLabel, "Quranlab"), othersLabel: s(st.othersLabel, ""), xStart: s(st.xStart, ""), xEnd: s(st.xEnd, ""), checkTitle: s(st.checkTitle, ""), checklist: strs(st.checklist, []), cta: s(st.cta, "") || undefined };
    case "time": return { type: "time", headline: s(st.headline, ""), goalLabel: s(st.goalLabel, ""), aloneLabel: s(st.aloneLabel, ""), xStart: s(st.xStart, ""), xEnd: s(st.xEnd, ""), placeholder: s(st.placeholder, ""), sentence: s(st.sentence, ""), cta: s(st.cta, "") || undefined,
      options: arr<any>(st.options, []).map((o) => ({ minutes: n(o?.minutes, 15), label: s(o?.label, ""), weeks: n(o?.weeks, 8) })).filter((o) => o.label) };
    case "email": return { type: "email", headline: s(st.headline, ""), sub: s(st.sub, ""), placeholder: s(st.placeholder, "ton@email.com"), cta: s(st.cta, ""), note: s(st.note, ""), skip: s(st.skip, "") || undefined };
    case "social": return { type: "social", headline: s(st.headline, ""), rating: s(st.rating, "4,9"), ratingSub: s(st.ratingSub, ""), sub: s(st.sub, ""), cta: s(st.cta, "") || undefined, lockSeconds: n(st.lockSeconds, 2.5),
      reviews: arr<any>(st.reviews, []).map((r) => ({ initials: s(r?.initials, ""), name: s(r?.name, ""), text: s(r?.text, "") })).filter((r) => r.text) };
    case "loader": return { type: "loader", headline: s(st.headline, ""), captions: strs(st.captions, []), durationMs: n(st.durationMs, 7000) };
    case "plan": return { type: "plan", headline: s(st.headline, ""), journeyTitle: s(st.journeyTitle, ""), levelPill: s(st.levelPill, ""), yourPlanLabel: s(st.yourPlanLabel, "TON PLAN"), minutesLabel: s(st.minutesLabel, "par jour"), dateLabel: s(st.dateLabel, "ton objectif"), cta: s(st.cta, ""),
      rows: arr<any>(st.rows, []).map((r) => ({ icon: s(r?.icon, "") || undefined, label: s(r?.label, ""), text: s(r?.text, "") })).filter((r) => r.label) };
    case "lesson": return { type: "lesson", headline: s(st.headline, ""), sub: s(st.sub, ""), doneHeadline: s(st.doneHeadline, ""), doneSub: s(st.doneSub, ""), cta: s(st.cta, "Continuer"),
      cards: arr<any>(st.cards, []).map((c) => ({ arabic: s(c?.arabic, ""), translit: s(c?.translit, ""), fr: s(c?.fr, ""), choices: strs(c?.choices, []) })).filter((c) => c.arabic && c.fr) };
    case "trial": return { type: "trial", headline: s(st.headline, ""), cta: s(st.cta, ""), screenshots: strs(st.screenshots, []) };
    case "bell": return { type: "bell", headline: s(st.headline, ""), cta: s(st.cta, "") };
    default: return null;
  }
}

export function mergeCommencerContent(stored: Partial<CommencerContent> | null): CommencerContent {
  const d = COMMENCER_DEFAULTS;
  if (!stored) return d;
  const steps = arr<any>(stored.steps, []).map(mergeStep).filter((x): x is CmStep => x !== null);
  const pw = (stored.paywall ?? {}) as Partial<CommencerContent["paywall"]>;
  const m = (stored.merci ?? {}) as Partial<CommencerContent["merci"]>;
  const u = (stored.upsell ?? {}) as Partial<CmUpsell>;
  return {
    accentColor: /^#[0-9a-fA-F]{6}$/.test(s(stored.accentColor, "")) ? (stored.accentColor as string) : d.accentColor,
    steps: steps.length ? steps : d.steps,
    // Stored JSON from the former trial paywall (timeline/weekly/annual) is
    // ignored: only the lifetime fields are read, defaults fill the rest.
    paywall: {
      badge: s(pw.badge, d.paywall.badge), title: s(pw.title, d.paywall.title), subtitle: s(pw.subtitle, d.paywall.subtitle),
      perks: Array.isArray(pw.perks)
        ? arr<any>(pw.perks, []).map((t) => ({ icon: s(t?.icon, "") || undefined, title: s(t?.title, ""), text: s(t?.text, "") })).filter((t) => t.title)
        : d.paywall.perks,
      amountCents: Math.max(0, Math.round(n(pw.amountCents, d.paywall.amountCents))),
      priceLabel: s(pw.priceLabel, d.paywall.priceLabel), compareLabel: s(pw.compareLabel, d.paywall.compareLabel),
      priceNote: s(pw.priceNote, d.paywall.priceNote), urgency: s(pw.urgency, d.paywall.urgency),
      reassurance: s(pw.reassurance, d.paywall.reassurance), cta: s(pw.cta, d.paywall.cta), finePrint: s(pw.finePrint, d.paywall.finePrint),
      guaranteeTitle: s(pw.guaranteeTitle, d.paywall.guaranteeTitle), guaranteeText: s(pw.guaranteeText, d.paywall.guaranteeText),
    },
    merci: {
      title: s(m.title, d.merci.title), text: s(m.text, d.merci.text), cta: s(m.cta, d.merci.cta),
      sourceHeadline: s(m.sourceHeadline, d.merci.sourceHeadline),
      sourceOptions: Array.isArray(m.sourceOptions) ? opts(m.sourceOptions) : d.merci.sourceOptions,
    },
    upsell: {
      enabled: typeof u.enabled === "boolean" ? u.enabled : d.upsell.enabled,
      badge: s(u.badge, d.upsell.badge), title: s(u.title, d.upsell.title), text: s(u.text, d.upsell.text),
      bullets: Array.isArray(u.bullets) ? u.bullets.filter((x): x is string => typeof x === "string") : d.upsell.bullets,
      amountCents: Math.max(0, Math.round(n(u.amountCents, d.upsell.amountCents))),
      priceLabel: s(u.priceLabel, d.upsell.priceLabel), compareLabel: s(u.compareLabel, d.upsell.compareLabel),
      cta: s(u.cta, d.upsell.cta), decline: s(u.decline, d.upsell.decline), note: s(u.note, d.upsell.note),
      doneTitle: s(u.doneTitle, d.upsell.doneTitle), doneText: s(u.doneText, d.upsell.doneText),
      bookBadge: s(u.bookBadge, d.upsell.bookBadge), bookTitle: s(u.bookTitle, d.upsell.bookTitle), bookCta: s(u.bookCta, d.upsell.bookCta),
      bookDecline: s(u.bookDecline, d.upsell.bookDecline), bookNote: s(u.bookNote, d.upsell.bookNote),
      bookDoneSuffix: s(u.bookDoneSuffix, d.upsell.bookDoneSuffix), bookDoneText: s(u.bookDoneText, d.upsell.bookDoneText),
    },
  };
}
