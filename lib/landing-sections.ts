/**
 * Section lists for the landing visibility toggles. Plain module (no
 * "server-only") so both the server pages and the client admin forms can
 * import these runtime values.
 */

/** All toggleable sections of /lire-larabe, in page order. */
export const ARABIC_SECTIONS: { key: string; label: string }[] = [
  { key: "testimonials", label: "Témoignages" },
  { key: "pricing", label: "Tarifs" },
  { key: "method", label: "Méthode" },
  { key: "program", label: "Programme (21 chapitres)" },
  { key: "comparison", label: "Comparatif" },
  { key: "faq", label: "FAQ" },
  { key: "sticky", label: "Barre flottante (bas)" },
];

/** Toggleable sections of /offre-a-vie, grouped by where they appear. */
export const LANDING_SECTIONS: {
  group: string;
  items: { key: string; label: string }[];
}[] = [
  {
    group: "Communes (classique & produit)",
    items: [
      { key: "reviews", label: "Avis" },
      { key: "faq", label: "FAQ" },
    ],
  },
  {
    group: "Variante classique",
    items: [
      { key: "trust", label: "Barre de confiance" },
      { key: "story", label: "Texte de vente (story)" },
      { key: "rows", label: "Sections explicatives" },
      { key: "valueStack", label: "Pack & bonus" },
      { key: "priceAnchor", label: "Fais le calcul" },
      { key: "finalCta", label: "CTA final" },
    ],
  },
  {
    group: "Variante Produit (V3)",
    items: [
      { key: "p_benefits", label: "Bénéfices" },
      { key: "p_inside", label: "Ce que tu reçois" },
      { key: "p_how", label: "Comment ça se passe" },
      { key: "p_compare", label: "Comparatif" },
      { key: "p_founder", label: "Fondateur" },
    ],
  },
  {
    group: "Variante Lettre (V2)",
    items: [
      { key: "l_insight", label: "Bloc « ce que j'ai compris »" },
      { key: "l_how", label: "Bloc « comment ça se passe »" },
      { key: "l_bonuses", label: "Bonus" },
    ],
  },
];
