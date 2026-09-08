export type CoranConversionItem = { title: string; text: string };
export const CORAN_CONVERSION_DEFAULTS = {
  heroBenefits: "Les 500 mots essentiels, réunis dans un guide PDF\nUne méthode de mémorisation pour avancer à ton rythme\nLes documents complémentaires et l’application inclus",
  paymentNote: "Paiement unique · Accès à vie · Sans abonnement",
  packHeading: "Voici exactement ce que tu reçois.",
  packIntro: "Un guide pour apprendre les mots. Des ressources pour en comprendre le contexte. Et une application pour continuer à pratiquer.",
  packCta: "Je commence avec le pack complet",
  savingsLabel: "Tu économises {amount}",
  stepsHeading: "Une petite routine. Un vrai rendez-vous avec le Coran.",
  faqHeading: "Les réponses avant de te lancer.",
  finalNote: "Choisis ton moyen de paiement ci-dessous. Tu recevras tes accès par email après confirmation du paiement.",
  showBanners: false,
  steps: [
    { title: "Découvre les mots", text: "Ouvre le guide des mots fréquents et avance par petites séances de 15 à 30 minutes." },
    { title: "Reviens sur ce que tu apprends", text: "Appuie-toi sur la méthode de Médine pour espacer tes révisions et replacer les mots dans leur contexte." },
    { title: "Fais le lien avec ta récitation", text: "Repère les mots rencontrés, explore le résumé des Juzz et continue à pratiquer dans l’application." },
  ],
  faq: [
    { title: "Que signifie « 85 % du Coran » ?", text: "Le guide se concentre sur les mots les plus fréquents du texte coranique. Reconnaître du vocabulaire ne signifie pas comprendre automatiquement 85 % de tous les versets : la grammaire, le contexte et la pratique comptent aussi. Ce parcours ne promet pas de devenir arabophone en un mois." },
    { title: "Combien de temps dois-je y consacrer ?", text: "Le programme propose un mois d’apprentissage, avec des séances de 15 à 30 minutes. Tu peux avancer plus lentement et revenir sur les documents : tes accès restent disponibles à vie. Ta progression dépend de ta pratique." },
    { title: "Est-ce un livre papier ou un abonnement ?", text: "C’est un pack numérique : les guides sont au format PDF et l’accès Premium à l’application est inclus à vie. Le prix affiché correspond à un paiement unique, sans abonnement." },
    { title: "Comment vais-je recevoir mes accès ?", text: "Après confirmation du paiement, tes accès sont envoyés à l’adresse email renseignée lors de la commande. Vérifie bien cette adresse. Si tu choisis Orange Money, l’envoi intervient après validation de la transaction." },
    { title: "Puis-je découvrir les documents avant d’acheter ?", text: "Oui. Les extraits de cette page te permettent de consulter les documents avant de choisir. Ouvre les couvertures ou les liens PDF pour voir le contenu réel du pack." },
  ],
};
export type CoranConversion = typeof CORAN_CONVERSION_DEFAULTS;
export function mergeCoranConversion(value?: Partial<CoranConversion> | null): CoranConversion {
  const d = CORAN_CONVERSION_DEFAULTS;
  const result = { ...d };
  for (const key of Object.keys(d) as (keyof CoranConversion)[]) {
    if (key === "steps" || key === "faq") {
      const items = value?.[key];
      if (Array.isArray(items)) result[key] = items.filter((item) => item && typeof item.title === "string" && typeof item.text === "string").slice(0, 20).map((item) => ({title:item.title.slice(0,300),text:item.text.slice(0,3000)}));
    } else if (key === "showBanners") {
      result[key] = value?.[key] === true;
    } else if (typeof value?.[key] === "string") result[key] = value[key]!.slice(0, 3000);
  }
  return result;
}
