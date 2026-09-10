/**
 * Content model for the /commencer onboarding funnel (Takallam-style flow
 * adapted to Quranlab, in the "editorial paper" DA). Every screen, option,
 * caption, plan and price is admin-editable. Client-safe: no server imports.
 */

export type CmOption = { id: string; label: string; icon?: string };
export type CmTimeOption = { minutes: number; label: string; weeks: number };
export type CmReview = { initials: string; name: string; text: string };
export type CmRow = { label: string; text: string; icon?: string };
export type CmTimelineItem = { title: string; text: string; icon?: string };

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
  | { type: "trial"; headline: string; cta: string; screenshots: string[] }
  | { type: "bell"; headline: string; cta: string };

export type CmPlan = { amountCents: number; interval: "week" | "year"; title: string; priceLabel: string; per: string; sub: string; tag: string; popular: boolean };

export type CommencerContent = {
  accentColor: string;
  steps: CmStep[];
  paywall: {
    title: string;
    subtitle: string;
    timeline: CmTimelineItem[];
    weekly: CmPlan;
    annual: CmPlan;
    reassurance: string;
    cta: string;
    finePrintAnnual: string;
    finePrintWeekly: string;
  };
  merci: { title: string; text: string; cta: string };
};

export const COMMENCER_KEY = "commencer_content";

export const COMMENCER_DEFAULTS: CommencerContent = {
  accentColor: "#F3B6C4",
  steps: [
    { type: "splash", arabic: "قُرْآن", brand: "QURANLAB", tagline: "COMPRENDS LE CORAN" },
    { type: "welcome", headline: "Bienvenue sur Quranlab", tagline: "Comprends le Coran.\n**Enfin.**", cta: "Continuer", signinText: "Déjà un compte ?", signinCta: "Se connecter" },
    { type: "question", id: "why", headline: "Pourquoi veux-tu comprendre le Coran ?", sub: "(Plusieurs choix possibles)", multi: true, options: [
      { id: "prayer", label: "Ressentir ma prière", icon: "🕌" },
      { id: "recite", label: "Comprendre ce que je récite", icon: "📖" },
      { id: "closer", label: "Me rapprocher d'Allah", icon: "🌙" },
      { id: "read", label: "Lire le Coran sans traduction", icon: "✨" },
      { id: "kids", label: "Le transmettre à mes enfants", icon: "👨‍👩‍👧" },
      { id: "other", label: "Autre", icon: "···" },
    ] },
    { type: "question", id: "pain", headline: "Ne pas comprendre, ça change quoi au quotidien ?", sub: "(Plusieurs choix possibles)", multi: true, options: [
      { id: "empty", label: "Je récite sans ressentir", icon: "🤍" },
      { id: "demot", label: "Je me démotive à lire le Coran", icon: "📕" },
      { id: "memo", label: "J'ai du mal à mémoriser des sourates", icon: "📗" },
      { id: "far", label: "Je me sens loin de ma foi", icon: "🌙" },
      { id: "talk", label: "Je n'ose pas participer aux discussions", icon: "💬" },
    ] },
    { type: "chart", headline: "Conçu pour te rapprocher du Coran", chartLabel: "Ta progression", brandLabel: "Quranlab", othersLabel: "Autres méthodes", xStart: "Mois 0", xEnd: "Mois 1", checkTitle: "Quranlab va t'aider à", checklist: [
      "Comprendre ce que tu dis en salat",
      "Reconnaître les 500 mots = 85% du Coran",
      "Retenir grâce à des révisions intelligentes",
      "Avancer quelques minutes par jour",
    ] },
    { type: "question", id: "source", headline: "Où as-tu entendu parler de nous ?", multi: false, options: [
      { id: "instagram", label: "Instagram", icon: "📷" }, { id: "tiktok", label: "TikTok", icon: "🎵" }, { id: "youtube", label: "YouTube", icon: "▶️" },
      { id: "snapchat", label: "Snapchat", icon: "👻" }, { id: "friend", label: "Un proche", icon: "👥" }, { id: "mosque", label: "Mosquée / communauté", icon: "🕌" }, { id: "other", label: "Autre", icon: "···" },
    ] },
    { type: "question", id: "gender", headline: "Pour calibrer ton plan", sub: "Cette réponse sert à personnaliser ton parcours.", multi: false, options: [ { id: "m", label: "Homme" }, { id: "f", label: "Femme" } ] },
    { type: "question", id: "level", headline: "Ton niveau en arabe coranique ?", sub: "Quranlab adapte les leçons à ton niveau.", multi: false, options: [
      { id: "l1", label: "Je débute totalement", icon: "▂" }, { id: "l2", label: "Je connais quelques mots", icon: "▃" }, { id: "l3", label: "Je reconnais des mots dans les sourates", icon: "▅" },
      { id: "l4", label: "Je comprends des versets simples", icon: "▆" }, { id: "l5", label: "Je comprends la plupart des versets", icon: "█" },
    ] },
    { type: "question", id: "alphabet", headline: "Sais-tu lire l'arabe ?", multi: false, options: [ { id: "yes", label: "Oui, je lis l'arabe", icon: "👍" }, { id: "no", label: "Pas encore (je lis en phonétique)", icon: "👎" } ] },
    { type: "question", id: "blockers", headline: "Qu'est-ce qui t'a freiné par le passé ?", sub: "Plusieurs choix possibles", multi: true, options: [
      { id: "time", label: "Pas assez de temps", icon: "⏰" }, { id: "method", label: "Aucune méthode / structure", icon: "📚" }, { id: "busy", label: "Trop occupé (travail / école)", icon: "💻" },
      { id: "consist", label: "Manque de régularité", icon: "🔁" }, { id: "hard", label: "L'arabe me semblait trop dur", icon: "🧩" }, { id: "other", label: "Autre", icon: "+" },
    ] },
    { type: "time", headline: "Combien de temps par jour ?", goalLabel: "Ton objectif", aloneLabel: "Seul(e)", xStart: "Maintenant", xEnd: "3 mois", placeholder: "Choisis une durée pour voir quand tu comprendras 85% du Coran.", sentence: "À {min} min par jour, tu comprendras 85% du Coran **en {weeks} semaines**.", options: [
      { minutes: 5, label: "5 min", weeks: 10 }, { minutes: 15, label: "15 min", weeks: 8 }, { minutes: 30, label: "30 min", weeks: 6 }, { minutes: 45, label: "45 min+", weeks: 5 },
    ] },
    { type: "email", headline: "Atteins ton objectif avec des rappels", sub: "Les personnes qui activent les rappels ont 3× plus de chances de tenir leur routine.", placeholder: "ton@email.com", cta: "Recevoir mon plan et mes rappels", note: "Pas de spam · désabonnement en 1 clic", skip: "Passer" },
    { type: "social", headline: "Ils comprennent enfin leur prière", rating: "4,9", ratingSub: "Plus de 1 500 apprenants", sub: "Quranlab a été conçu pour des gens comme toi", reviews: [
      { initials: "OM", name: "Omar", text: "Je récitais sans rien comprendre depuis 15 ans. En quelques jours je reconnais des mots dans ma prière. Ça a tout changé." },
      { initials: "NA", name: "Nayah", text: "Enfin je SAIS ce que je dis quand je prie. La façon la plus simple que j'ai trouvée. Barak Allah fikoum." },
      { initials: "YA", name: "Yassine", text: "Quelques minutes par jour et Al-Fatiha a pris un tout autre sens. Je recommande à 100 %." },
    ], lockSeconds: 2.5 },
    { type: "loader", headline: "Création de ton plan personnalisé", captions: ["Optimisation pour l'arabe coranique…", "Calibrage à ton niveau…", "Préparation de tes premières leçons…"], durationMs: 7000 },
    { type: "plan", headline: "Ton plan personnalisé est prêt", journeyTitle: "Parcours Coran", levelPill: "Niveau {level} · {levelLabel}", yourPlanLabel: "TON PLAN", minutesLabel: "par jour", dateLabel: "ton objectif", rows: [
      { icon: "🎯", label: "Objectif", text: "Comprendre chaque mot de ta prière" },
      { icon: "🔧", label: "Ce qu'on corrige cette fois", text: "Des leçons de {min} min qui tiennent dans ta journée" },
      { icon: "🧩", label: "Focus", text: "Vocabulaire · Versets · Prière" },
    ], cta: "Commencer mon plan" },
    { type: "trial", headline: "On veut que tu essaies Quranlab **gratuitement**", cta: "Essayer pour 0,00 €", screenshots: [] },
    { type: "bell", headline: "On t'enverra un rappel avant la fin de ton essai gratuit", cta: "Continuer GRATUITEMENT" },
  ],
  paywall: {
    title: "Commence tes 7 jours **GRATUITS**",
    subtitle: "Rejoins 1 500+ apprenants",
    timeline: [
      { icon: "🔓", title: "Aujourd'hui", text: "Accès complet à l'app : les 500 mots, les leçons, les révisions." },
      { icon: "🔔", title: "Dans 5 jours – Rappel", text: "Tu reçois un email avant la fin de ton essai." },
      { icon: "💳", title: "Dans 7 jours – Facturation", text: "Tu seras débité le {date}, sauf si tu annules avant." },
    ],
    annual: { amountCents: 4700, interval: "year", title: "Annuel", priceLabel: "47 €", per: "/ an", sub: "≈ 3,92 € / mois", tag: "−82 % • 7 JOURS GRATUITS", popular: true },
    weekly: { amountCents: 499, interval: "week", title: "Hebdomadaire", priceLabel: "4,99 €", per: "/ semaine", sub: "7 jours gratuits", tag: "", popular: false },
    reassurance: "Aucun paiement aujourd'hui",
    cta: "Commencer mes 7 jours gratuits",
    finePrintAnnual: "7 jours gratuits, puis 47 € par an (3,92 €/mois). Annulable à tout moment.",
    finePrintWeekly: "7 jours gratuits, puis 4,99 € par semaine. Annulable à tout moment.",
  },
  merci: { title: "Ton essai gratuit a commencé, barak Allah fik !", text: "Un email vient de t'être envoyé pour **créer ton compte** et démarrer ton plan. Pense à vérifier tes spams.", cta: "Créer mon compte" },
};

const s = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
const n = (v: unknown, fb: number) => (typeof v === "number" && Number.isFinite(v) ? v : fb);
const arr = <T,>(v: unknown, fb: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fb);
const strs = (v: unknown, fb: string[]) => arr<unknown>(v, fb).map((x) => s(x, "")).filter(Boolean);

function mergeStep(st: any): CmStep | null {
  if (!st || typeof st.type !== "string") return null;
  switch (st.type as CmStep["type"]) {
    case "splash": return { type: "splash", arabic: s(st.arabic, "قُرْآن"), brand: s(st.brand, "QURANLAB"), tagline: s(st.tagline, "") };
    case "welcome": return { type: "welcome", headline: s(st.headline, ""), tagline: s(st.tagline, ""), cta: s(st.cta, "Continuer"), signinText: s(st.signinText, ""), signinCta: s(st.signinCta, "") };
    case "question": return { type: "question", id: s(st.id, "q"), headline: s(st.headline, ""), sub: s(st.sub, "") || undefined, multi: st.multi === true, cta: s(st.cta, "") || undefined,
      options: arr<any>(st.options, []).map((o) => ({ id: s(o?.id, ""), label: s(o?.label, ""), icon: s(o?.icon, "") || undefined })).filter((o) => o.id && o.label) };
    case "chart": return { type: "chart", headline: s(st.headline, ""), chartLabel: s(st.chartLabel, ""), brandLabel: s(st.brandLabel, "Quranlab"), othersLabel: s(st.othersLabel, ""), xStart: s(st.xStart, ""), xEnd: s(st.xEnd, ""), checkTitle: s(st.checkTitle, ""), checklist: strs(st.checklist, []), cta: s(st.cta, "") || undefined };
    case "time": return { type: "time", headline: s(st.headline, ""), goalLabel: s(st.goalLabel, ""), aloneLabel: s(st.aloneLabel, ""), xStart: s(st.xStart, ""), xEnd: s(st.xEnd, ""), placeholder: s(st.placeholder, ""), sentence: s(st.sentence, ""), cta: s(st.cta, "") || undefined,
      options: arr<any>(st.options, []).map((o) => ({ minutes: n(o?.minutes, 15), label: s(o?.label, ""), weeks: n(o?.weeks, 8) })).filter((o) => o.label) };
    case "email": return { type: "email", headline: s(st.headline, ""), sub: s(st.sub, ""), placeholder: s(st.placeholder, "ton@email.com"), cta: s(st.cta, ""), note: s(st.note, ""), skip: s(st.skip, "") || undefined };
    case "social": return { type: "social", headline: s(st.headline, ""), rating: s(st.rating, "4,9"), ratingSub: s(st.ratingSub, ""), sub: s(st.sub, ""), cta: s(st.cta, "") || undefined, lockSeconds: n(st.lockSeconds, 2.5),
      reviews: arr<any>(st.reviews, []).map((r) => ({ initials: s(r?.initials, ""), name: s(r?.name, ""), text: s(r?.text, "") })).filter((r) => r.text) };
    case "loader": return { type: "loader", headline: s(st.headline, ""), captions: strs(st.captions, []), durationMs: n(st.durationMs, 7000) };
    case "plan": return { type: "plan", headline: s(st.headline, ""), journeyTitle: s(st.journeyTitle, ""), levelPill: s(st.levelPill, ""), yourPlanLabel: s(st.yourPlanLabel, "TON PLAN"), minutesLabel: s(st.minutesLabel, "par jour"), dateLabel: s(st.dateLabel, "ton objectif"), cta: s(st.cta, ""),
      rows: arr<any>(st.rows, []).map((r) => ({ icon: s(r?.icon, "") || undefined, label: s(r?.label, ""), text: s(r?.text, "") })).filter((r) => r.label) };
    case "trial": return { type: "trial", headline: s(st.headline, ""), cta: s(st.cta, ""), screenshots: strs(st.screenshots, []) };
    case "bell": return { type: "bell", headline: s(st.headline, ""), cta: s(st.cta, "") };
    default: return null;
  }
}

function mergePlan(p: any, d: CmPlan): CmPlan {
  return { amountCents: Math.max(0, Math.round(n(p?.amountCents, d.amountCents))), interval: p?.interval === "week" || p?.interval === "year" ? p.interval : d.interval,
    title: s(p?.title, d.title), priceLabel: s(p?.priceLabel, d.priceLabel), per: s(p?.per, d.per), sub: s(p?.sub, d.sub), tag: s(p?.tag, d.tag), popular: typeof p?.popular === "boolean" ? p.popular : d.popular };
}

export function mergeCommencerContent(stored: Partial<CommencerContent> | null): CommencerContent {
  const d = COMMENCER_DEFAULTS;
  if (!stored) return d;
  const steps = arr<any>(stored.steps, []).map(mergeStep).filter((x): x is CmStep => x !== null);
  const pw = (stored.paywall ?? {}) as Partial<CommencerContent["paywall"]>;
  const m = (stored.merci ?? {}) as Partial<CommencerContent["merci"]>;
  return {
    accentColor: /^#[0-9a-fA-F]{6}$/.test(s(stored.accentColor, "")) ? (stored.accentColor as string) : d.accentColor,
    steps: steps.length ? steps : d.steps,
    paywall: {
      title: s(pw.title, d.paywall.title), subtitle: s(pw.subtitle, d.paywall.subtitle),
      timeline: arr<any>(pw.timeline, d.paywall.timeline).map((t) => ({ icon: s(t?.icon, "") || undefined, title: s(t?.title, ""), text: s(t?.text, "") })).filter((t) => t.title),
      weekly: mergePlan(pw.weekly, d.paywall.weekly), annual: mergePlan(pw.annual, d.paywall.annual),
      reassurance: s(pw.reassurance, d.paywall.reassurance), cta: s(pw.cta, d.paywall.cta),
      finePrintAnnual: s(pw.finePrintAnnual, d.paywall.finePrintAnnual), finePrintWeekly: s(pw.finePrintWeekly, d.paywall.finePrintWeekly),
    },
    merci: { title: s(m.title, d.merci.title), text: s(m.text, d.merci.text), cta: s(m.cta, d.merci.cta) },
  };
}
