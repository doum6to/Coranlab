import { buildEmail, buttonHtml, escapeHtml, fineHtml, pHtml } from "./_shell";

type Props = {
  productName: string;
  driveUrl: string;
};

/** Simple delivery email: a heading + a button to the Google Drive link. */
export function renderDriveProductEmailHtml({ productName, driveUrl }: Props): string {
  const driveSafe = escapeHtml(driveUrl);
  const nameSafe = escapeHtml(productName);

  const body = [
    pHtml("Assalamu alaikum,", { bold: true }),
    pHtml(
      `Merci pour ta confiance. Voici ton accès à <strong>${nameSafe}</strong>, en un clic ci-dessous.`,
    ),
    buttonHtml({ href: driveUrl, label: "Accéder à mes documents →" }),
    fineHtml(
      `Si le bouton ne fonctionne pas, copie ce lien&nbsp;:<br /><a href="${driveSafe}" style="color:#6967fb;word-break:break-all">${driveSafe}</a>`,
    ),
  ].join("\n");

  return buildEmail({
    preview: `Ton accès à ${productName} est prêt. Un clic pour y accéder.`,
    heading: "Ton accès est prêt.",
    bodyHtml: body,
  });
}
