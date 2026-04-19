import { buildEmail, buttonHtml, escapeHtml, fineHtml, pHtml } from "./_shell";

export function renderTrialEndingSoonHtml({
  billingPortalUrl,
  trialEndsAt,
}: {
  billingPortalUrl: string;
  trialEndsAt: string;
}): string {
  const body = [
    pHtml(
      `Ton essai gratuit se termine le <strong>${escapeHtml(trialEndsAt)}</strong>. Si tu continues, ton abonnement passera à <strong>14,97&nbsp;€/mois</strong> automatiquement.`
    ),
    pHtml(
      "<strong>Tu veux continuer&nbsp;?</strong> Tu n'as rien à faire. Tu restes dans l'app, la facturation se fait toute seule."
    ),
    pHtml(
      "<strong>Tu préfères arrêter&nbsp;?</strong> Aucun souci&nbsp;: clique ci-dessous pour résilier, tu ne seras pas facturé."
    ),
    buttonHtml({ href: billingPortalUrl, label: "Gérer mon abonnement" }),
    fineHtml(
      "Résiliation en 1 clic, aucun frais. Tu gardes l'accès jusqu'à la fin de ton essai."
    ),
  ].join("\n");

  return buildEmail({
    preview: "Ton essai Quranlab se termine dans 3 jours.",
    heading: "Plus que 3 jours d'essai",
    bodyHtml: body,
  });
}
