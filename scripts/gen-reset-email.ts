import { buildEmail, buttonHtml, pHtml, fineHtml } from "../lib/email/templates/_shell";

// Supabase injects the recovery link in place of {{ .ConfirmationURL }}.
const body = [
  pHtml("Assalamu alaikum,", { bold: true }),
  pHtml(
    "Tu as demandé à réinitialiser le mot de passe de ton compte Quranlab. Clique sur le bouton ci-dessous pour en choisir un nouveau.",
  ),
  buttonHtml({
    href: "{{ .ConfirmationURL }}",
    label: "Réinitialiser mon mot de passe",
    variant: "coral",
  }),
  fineHtml(
    "Ce lien est valable une heure. Si tu n'es pas à l'origine de cette demande, ignore simplement cet e-mail : ton mot de passe reste inchangé.",
  ),
].join("\n");

process.stdout.write(
  buildEmail({
    preview: "Choisis un nouveau mot de passe Quranlab.",
    heading: "Réinitialise ton mot de passe",
    bodyHtml: body,
  }),
);
