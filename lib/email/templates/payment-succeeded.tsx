import { buildEmail, buttonHtml, escapeHtml, fineHtml, pHtml } from "./_shell";

export function renderPaymentSucceededHtml({
  appUrl,
  amount,
  nextBillingAt,
}: {
  appUrl: string;
  amount: string; // "14,97€"
  nextBillingAt: string;
}): string {
  const body = [
    pHtml(
      `Ton paiement de <strong>${escapeHtml(amount)}</strong> a bien été reçu. Ton abonnement Quranlab continue pour un mois de plus.`
    ),
    fineHtml(
      `Prochaine facturation le <strong>${escapeHtml(nextBillingAt)}</strong>.`
    ),
    buttonHtml({ href: appUrl, label: "Retour à l'application →" }),
    fineHtml(
      "Tu peux modifier ton moyen de paiement ou résilier à tout moment depuis tes paramètres."
    ),
  ].join("\n");

  return buildEmail({
    preview: "Paiement confirmé. Ton abonnement Quranlab continue.",
    heading: "Paiement reçu, merci",
    bodyHtml: body,
  });
}
