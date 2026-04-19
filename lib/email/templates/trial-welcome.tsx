import { buildEmail, buttonHtml, escapeHtml, fineHtml, pHtml } from "./_shell";

export function renderTrialWelcomeHtml({
  appUrl,
  trialEndsAt,
}: {
  appUrl: string;
  trialEndsAt: string;
}): string {
  const body = [
    pHtml("Assalamu alaikum&nbsp;!"),
    pHtml(
      "Ton essai <strong>7 jours gratuits</strong> est actif. Tu as accès dès maintenant à toutes les leçons, exercices et documents PDF de Quranlab."
    ),
    buttonHtml({ href: appUrl, label: "Accéder à l'application →" }),
    fineHtml(
      `Ton essai se termine le <strong>${escapeHtml(trialEndsAt)}</strong>. Après cette date, ton abonnement passera à 14,97&nbsp;€/mois si tu ne résilies pas. Tu peux annuler en 1 clic depuis tes paramètres.`
    ),
    pHtml(
      "<strong>Petit conseil</strong>&nbsp;: même 5 minutes par jour suffisent. La répétition espacée fait le reste."
    ),
  ].join("\n");

  return buildEmail({
    preview: "Ton essai Quranlab est actif. Commence dès maintenant.",
    heading: "Bienvenue dans Quranlab",
    bodyHtml: body,
  });
}
