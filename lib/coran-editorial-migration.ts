import type { CoranLandingContent, CoranBlock } from "./coran-landing-shared";
import { CORAN_EDITORIAL_DEFAULTS } from "./coran-landing-shared";

// Only convert the three graphics observed on the existing /coran page.
// Unknown/custom blocks, prices, checkout settings and PDFs are never replaced.
// The admin reads this same result; saving persists the editable copy and marks
// the transition with `editorial`, so later user edits are never migrated again.
const ROOT = "https://pogfkwweomyypasnxieh.supabase.co/storage/v1/object/public/images/coran/";
const LEGACY_COPY: Record<string, CoranBlock[]> = {
  [`${ROOT}3fa45822-1920-473b-9f58-6beeba9726c0.webp`]: [
    { type: "text", heading: "L’essentiel, un jour après l’autre", text: "On n’a pas besoin de tout l’arabe pour commencer à comprendre le Coran. Les mêmes mots reviennent, les mêmes structures aussi. En apprenant à les reconnaître, tu retrouves peu à peu le sens de ce que tu récites." },
    { type: "text", heading: "Une place dans ton quotidien", text: "Le programme propose un mois d’apprentissage, avec 15 à 30 minutes par jour. Tu avances doucement, sans pression : un peu de vocabulaire et la grammaire qui sert vraiment. L’objectif : reconnaître les mots, anticiper leur sens et mieux te repérer dans les versets." },
    { type: "text", heading: "Le témoignage de Hamza", text: "« La première fois que j’ai compris les mots que je récitais dans ma prière, j’ai fondu en larmes. C’était comme si j’avais prié toute ma vie en mode silencieux… et que le son venait enfin d’être activé. »\nHamza · 9 septembre 2025" },
  ],
  [`${ROOT}6850e7a0-ee91-4575-b4ce-6cfc5553a38f.webp`]: [
    { type: "text", heading: "Retrouver le sens dans la prière", text: "Quand tu comprends ce que tu récites, la prière prend une autre profondeur. En 30 jours, tu ne deviendras pas arabophone : ce parcours t’aide à lire avec plus de sérénité et à te rapprocher du sens des mots." },
    { type: "text", heading: "Un parcours pour toi", text: "Tu veux comprendre ce que tu lis, avancer sans te noyer dans la théorie et te rapprocher du Coran, simplement. Le programme se concentre sur l’essentiel et te laisse progresser à ton rythme." },
  ],
  [`${ROOT}32f00f4c-01bf-43c6-a799-2235e9cb0ea2.webp`]: [
    { type: "text", heading: "Ce que tu vas recevoir", text: "• L’ebook des 500 mots essentiels, parmi les plus fréquents du Coran.\n• La méthodologie de Médine : une mémorisation espacée et contextualisée.\n• Le résumé des 30 Juzz pour mieux comprendre les contextes.\n• Le recueil des du’as du Coran : les invocations des prophètes, de leurs disciples et des anges.\n• L’accès Premium à l’application privée, à vie, sans abonnement, 24 h/24.\n• Tes accès envoyés par email après le paiement." },
  ],
};

export function migrateCoranEditorial(stored: Partial<CoranLandingContent>): Partial<CoranLandingContent> {
  if (!stored || stored.editorial || !Array.isArray(stored.body)) return stored;
  const known = stored.body.filter((b) => b.type === "image" && Object.hasOwn(LEGACY_COPY, b.url));
  if (known.length !== 3) return stored;
  return {
    ...stored,
    editorial: { ...CORAN_EDITORIAL_DEFAULTS },
    body: stored.body.flatMap((block) => block.type === "image" && Object.hasOwn(LEGACY_COPY, block.url) ? LEGACY_COPY[block.url] : [block]),
    // The old black/white theme existed to support transparent copy graphics.
    // Other saved color choices are preserved.
    bgColor: stored.bgColor?.toLowerCase() === "#000000" ? "#f8faf8" : stored.bgColor,
    textColor: stored.bgColor?.toLowerCase() === "#000000" && stored.textColor?.toLowerCase() === "#ffffff" ? "#132f37" : stored.textColor,
  };
}
