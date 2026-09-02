import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import {
  type CoranLandingContent,
  CORAN_LANDING_DEFAULTS,
  mergeCoranLandingContent,
} from "@/lib/coran-landing-content";

/**
 * Admin-editable content for a SECOND, ultra-targeted /coran variant aimed at
 * the "I pray but I don't understand a word" avatar. Same product & shape as
 * /coran (lifetime access), just its own copy + price, independently editable.
 */
export const CORAN_PRIERE_LANDING_KEY = "coran_priere_landing_content";

export const CORAN_PRIERE_LANDING_DEFAULTS: CoranLandingContent = {
  ...CORAN_LANDING_DEFAULTS,
  title: "Tu pries 5 fois par jour… sans comprendre un seul mot ?",
  subtitle:
    "Apprends les 500 mots qui reviennent en boucle dans le Coran et ressens enfin ta prière au lieu de la réciter par cœur.",
  body: [
    {
      type: "text",
      text: "Tu connais Al-Fatiha par cœur. Tu la récites depuis des années. Mais si on te demandait ce que veut dire chaque mot… tu resterais bloqué. Et au fond, ça te pèse : tu parles à Allah sans savoir ce que tu Lui dis.",
    },
    {
      type: "text",
      text: "La bonne nouvelle : 500 mots représentent 85% du Coran. Une fois que tu les connais, ta prière change complètement. Tu ne récites plus — tu comprends, tu ressens, tu es présent.",
    },
    {
      type: "text",
      text: "Pas besoin d'apprendre l'arabe pendant 5 ans. Juste les bons mots, dans le bon ordre, expliqués simplement. Accès à vie, un seul paiement.",
    },
  ],
  deliverables: [
    "Accès Premium à vie à l'application",
    "Les 500 mots essentiels expliqués simplement",
    "Comprends enfin Al-Fatiha et tes sourates du quotidien",
    "Accès immédiat envoyé par email",
  ],
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
  ],
  ctaLabel: "Je veux comprendre ma prière",
  guarantee: "Paiement sécurisé · Accès immédiat · Garantie 30 jours",
  stickyBarText: "Offre limitée · Accès à vie · Sans abonnement",
};

/** Reads the /comprendre-sa-priere content, falling back to defaults. Cached per request. */
export const getCoranPriereLandingContent = cache(
  async (): Promise<CoranLandingContent> => {
    try {
      const row = await db.query.appSetting.findFirst({
        where: eq(appSetting.key, CORAN_PRIERE_LANDING_KEY),
      });
      if (!row?.value) return CORAN_PRIERE_LANDING_DEFAULTS;
      return mergeCoranLandingContent(JSON.parse(row.value), CORAN_PRIERE_LANDING_DEFAULTS);
    } catch (e) {
      console.error("[coran-priere-landing] read failed, using defaults:", e);
      return CORAN_PRIERE_LANDING_DEFAULTS;
    }
  },
);
