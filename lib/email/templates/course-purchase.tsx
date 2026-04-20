import { buildEmail, buttonHtml, escapeHtml, fineHtml, pHtml } from "./_shell";

type Props = {
  driveUrl: string;
  hasApp: boolean;
  activationUrl: string | null;
};

export function renderCoursePurchaseEmailHtml({
  driveUrl,
  hasApp,
  activationUrl,
}: Props): string {
  const driveSafe = escapeHtml(driveUrl);

  const trialBlock =
    hasApp && activationUrl
      ? `
  <hr style="border:none;border-top:1px solid #E8E4D8;margin:40px 0" />
  <h2 style="font-family:Georgia,serif;font-style:italic;font-size:28px;color:#1A1A1A;margin:0 0 16px;font-weight:400;line-height:1.1;text-align:center">
    Et l&rsquo;application&nbsp;?
  </h2>
  ${pHtml(
    "Tu as aussi choisi l'accès à l'application Quranlab. Crée ton compte en un clic, ton abonnement sera activé automatiquement."
  )}
  ${buttonHtml({
    href: activationUrl,
    label: "Créer mon compte premium",
    variant: "coral",
  })}
  ${fineHtml(
    "Utilise la même adresse que celle-ci pour que l'abonnement soit lié automatiquement."
  )}
`
      : "";

  const body = [
    pHtml("Assalamu alaikum,", { bold: true }),
    pHtml(
      "Merci pour ta confiance. Ton pack <strong>85% des mots du Coran</strong> est disponible en un clic ci-dessous."
    ),
    buttonHtml({ href: driveUrl, label: "Accéder à mes documents →" }),
    fineHtml(
      `Si le bouton ne fonctionne pas, copie ce lien&nbsp;:<br /><a href="${driveSafe}" style="color:#6967fb;word-break:break-all">${driveSafe}</a>`
    ),
    trialBlock,
  ].join("\n");

  return buildEmail({
    preview: "Ton pack 85% des mots du Coran est prêt. Un clic pour y accéder.",
    heading: "Ton pack est prêt.",
    bodyHtml: body,
  });
}
