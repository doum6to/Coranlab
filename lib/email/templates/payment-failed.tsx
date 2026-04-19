import { buildEmail, buttonHtml, fineHtml, pHtml } from "./_shell";

export function renderPaymentFailedHtml({
  billingPortalUrl,
}: {
  billingPortalUrl: string;
}): string {
  const body = [
    pHtml(
      "On a tenté de renouveler ton abonnement Quranlab, mais le paiement n'est pas passé (carte expirée, fonds insuffisants, ou refus bancaire)."
    ),
    pHtml(
      "<strong>Pour conserver ton accès</strong>, mets à jour ton moyen de paiement dans les prochains jours. Stripe retentera automatiquement."
    ),
    buttonHtml({
      href: billingPortalUrl,
      label: "Mettre à jour ma carte",
      variant: "coral",
    }),
    fineHtml(
      "Si tu préfères arrêter, tu n'as rien à faire&nbsp;: ton abonnement sera annulé automatiquement après plusieurs échecs de paiement."
    ),
  ].join("\n");

  return buildEmail({
    preview: "Ton paiement Quranlab n'est pas passé.",
    heading: "Paiement non abouti",
    bodyHtml: body,
  });
}
