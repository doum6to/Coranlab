import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";

/** One Quranic word taught in the free lead-magnet email. */
export type LeadMagnetWord = {
  /** Arabic script, e.g. "رَبّ". */
  arabic: string;
  /** Phonetic transliteration, e.g. "Rabb". */
  translit: string;
  /** French meaning, e.g. "Seigneur". */
  fr: string;
};

/** One step of the follow-up (nurture) drip sequence. */
export type NurtureStep = {
  /** Days after the previous email (or after signup, for step 1) to send this. */
  delayDays: number;
  subject: string;
  /** Body HTML (simple <p>, <strong>, <br> — kept minimal). */
  bodyHtml: string;
};

export type LeadMagnetContent = {
  /** Copy of the on-page capture widget. */
  captureHeading: string;
  captureSubtext: string;
  captureButton: string;
  /** Lead-magnet email. */
  emailSubject: string;
  emailHeading: string;
  emailIntro: string;
  words: LeadMagnetWord[];
  /** CTA button under the words → the paid offer. */
  ctaLabel: string;
  /** Path (relative) or absolute URL the CTA points to. */
  ctaUrl: string;
  /** Follow-up drip emails sent to leads who haven't purchased. */
  nurture: NurtureStep[];
};

export const LEAD_MAGNET_KEY = "lead_magnet_content";

export const LEAD_MAGNET_DEFAULTS: LeadMagnetContent = {
  captureHeading: "Reçois gratuitement les 20 premiers mots du Coran",
  captureSubtext:
    "Les mots qui reviennent le plus souvent, avec leur sens. Directement par email, gratuitement.",
  captureButton: "Recevoir mes 20 mots gratuits",
  emailSubject: "Voici tes 20 premiers mots du Coran 📖",
  emailHeading: "Tes 20 premiers mots.",
  emailIntro:
    "Assalamu alaikum,<br/><br/>Voici 20 des mots les plus fréquents du Coran. Rien qu'avec eux, tu vas commencer à reconnaître des passages entiers dans ta prière. Lis-les doucement, à voix haute :",
  // NOTE (admin): à vérifier / compléter par tes soins. Translittérations simplifiées.
  words: [
    { arabic: "اللّٰه", translit: "Allah", fr: "Dieu (Allah)" },
    { arabic: "رَبّ", translit: "Rabb", fr: "Seigneur" },
    { arabic: "رَحْمٰن", translit: "Rahmân", fr: "Le Tout-Miséricordieux" },
    { arabic: "رَحِيم", translit: "Rahîm", fr: "Le Très-Miséricordieux" },
    { arabic: "يَوْم", translit: "Yawm", fr: "Jour" },
    { arabic: "دِين", translit: "Dîn", fr: "Religion / rétribution" },
    { arabic: "عَالَمِين", translit: "'Âlamîn", fr: "Les mondes / l'univers" },
    { arabic: "حَمْد", translit: "Hamd", fr: "Louange" },
    { arabic: "صِرَاط", translit: "Sirât", fr: "Chemin / voie" },
    { arabic: "مُسْتَقِيم", translit: "Mustaqîm", fr: "Droit (le droit chemin)" },
    { arabic: "نَعْبُد", translit: "Na'bud", fr: "Nous adorons" },
    { arabic: "نَسْتَعِين", translit: "Nasta'în", fr: "Nous demandons aide" },
    { arabic: "اِهْدِ", translit: "Ihdi", fr: "Guide-(nous)" },
    { arabic: "نَاس", translit: "Nâs", fr: "Les gens / l'humanité" },
    { arabic: "قُلْ", translit: "Qul", fr: "Dis" },
    { arabic: "أَحَد", translit: "Ahad", fr: "Unique" },
    { arabic: "خَلَق", translit: "Khalaqa", fr: "Il a créé" },
    { arabic: "كِتَاب", translit: "Kitâb", fr: "Livre" },
    { arabic: "مُؤْمِنِين", translit: "Mu'minîn", fr: "Les croyants" },
    { arabic: "جَنَّة", translit: "Jannah", fr: "Paradis / jardin" },
  ],
  ctaLabel: "Comprendre 85% du Coran — accès à vie",
  ctaUrl: "/coran",
  nurture: [
    {
      delayDays: 2,
      subject: "Tu récites ça tous les jours (et voici ce que ça veut dire)",
      bodyHtml:
        "<p>Hier tu as reçu 20 mots. Aujourd'hui, une question :</p><p>Quand tu dis <strong>« Alhamdulillah »</strong>, tu sais que ça contient le mot <em>Hamd</em> (la louange) que tu viens d'apprendre ?</p><p>C'est exactement ça, l'effet boule de neige : quelques mots, et des phrases entières s'éclairent. Imagine avec 500 mots — 85% du Coran.</p>",
    },
    {
      delayDays: 3,
      subject: "Pourquoi tu n'as pas besoin d'apprendre l'arabe pendant 5 ans",
      bodyHtml:
        "<p>La plupart des gens abandonnent l'arabe parce qu'ils veulent tout apprendre : grammaire, conjugaison, vocabulaire…</p><p>Mais pour <strong>comprendre le Coran</strong>, tu n'as pas besoin de tout ça. 500 mots reviennent en boucle et couvrent 85% du texte. C'est le raccourci intelligent.</p><p>C'est tout ce qu'il y a dans l'app Quranlab, expliqué simplement.</p>",
    },
    {
      delayDays: 4,
      subject: "Ce que ressentent ceux qui comprennent enfin leur prière",
      bodyHtml:
        "<p>« Je récitais sans rien comprendre depuis 15 ans. En quelques jours je reconnais des mots dans ma prière. Ça a tout changé. » — Omar</p><p>Ce n'est pas une question d'intelligence ni de niveau. C'est une question de méthode.</p><p>Accès à vie, un seul paiement, sans abonnement.</p>",
    },
    {
      delayDays: 5,
      subject: "Une dernière chose avant de te laisser",
      bodyHtml:
        "<p>Je ne vais pas t'envoyer d'emails à l'infini, promis.</p><p>Juste ceci : le prix de l'accès à vie est plus bas qu'un repas au restaurant, et c'est pour <strong>toute ta vie</strong>. Combien de prières te reste-t-il à accomplir, in shâ' Allah ? Autant les comprendre.</p><p>Si le moment est bon pour toi, c'est ici 👇</p>",
    },
  ],
};

function merge(stored: Partial<LeadMagnetContent> | null): LeadMagnetContent {
  const d = LEAD_MAGNET_DEFAULTS;
  if (!stored) return d;
  const str = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);
  return {
    captureHeading: str(stored.captureHeading, d.captureHeading),
    captureSubtext: str(stored.captureSubtext, d.captureSubtext),
    captureButton: str(stored.captureButton, d.captureButton),
    emailSubject: str(stored.emailSubject, d.emailSubject),
    emailHeading: str(stored.emailHeading, d.emailHeading),
    emailIntro: str(stored.emailIntro, d.emailIntro),
    words: Array.isArray(stored.words)
      ? stored.words.map((w) => ({
          arabic: String(w?.arabic ?? ""),
          translit: String(w?.translit ?? ""),
          fr: String(w?.fr ?? ""),
        }))
      : d.words,
    ctaLabel: str(stored.ctaLabel, d.ctaLabel),
    ctaUrl: str(stored.ctaUrl, d.ctaUrl),
    nurture: Array.isArray(stored.nurture)
      ? stored.nurture.map((n) => ({
          delayDays:
            typeof n?.delayDays === "number" && Number.isFinite(n.delayDays)
              ? n.delayDays
              : 2,
          subject: String(n?.subject ?? ""),
          bodyHtml: String(n?.bodyHtml ?? ""),
        }))
      : d.nurture,
  };
}

/** Reads the lead-magnet content, falling back to defaults. Cached per request. */
export const getLeadMagnetContent = cache(async (): Promise<LeadMagnetContent> => {
  try {
    const row = await db.query.appSetting.findFirst({
      where: eq(appSetting.key, LEAD_MAGNET_KEY),
    });
    if (!row?.value) return LEAD_MAGNET_DEFAULTS;
    return merge(JSON.parse(row.value));
  } catch (e) {
    console.error("[lead-magnet] read failed, using defaults:", e);
    return LEAD_MAGNET_DEFAULTS;
  }
});
