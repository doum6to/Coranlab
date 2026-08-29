import { buildEmail, buttonHtml, fineHtml, pHtml } from "./_shell";

/**
 * Post-purchase email for the /apprendre-coran recurring subscription.
 * Unlike the course email, it mentions NO PDF/pack — just: your Premium access
 * is active, create your account (one click) to start.
 */
export function renderSubscriptionWelcomeEmailHtml({
  activationUrl,
}: {
  activationUrl: string;
}): string {
  const body = [
    pHtml("Assalamu alaikum,", { bold: true }),
    pHtml(
      "Merci pour ta confiance — ton accès <strong>Quranlab Premium</strong> est activé."
    ),
    pHtml(
      "Dernière étape : crée ton compte en un clic pour commencer à comprendre le Coran, mot à mot."
    ),
    buttonHtml({
      href: activationUrl,
      label: "Créer mon compte",
      variant: "coral",
    }),
    fineHtml(
      "Utilise la même adresse e-mail que celle-ci pour que ton abonnement soit lié automatiquement. Tu peux gérer ou annuler ton abonnement à tout moment depuis tes réglages."
    ),
  ].join("\n");

  return buildEmail({
    preview: "Ton accès Premium est activé — crée ton compte pour commencer.",
    heading: "Bienvenue sur Quranlab Premium",
    bodyHtml: body,
  });
}
