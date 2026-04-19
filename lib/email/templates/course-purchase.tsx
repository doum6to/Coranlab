/**
 * Premium course-purchase welcome email — rendered as a plain HTML
 * string to bypass @react-email/components entirely. The @react-email
 * render pipeline was throwing "t is not a function" under the current
 * Next/Resend combo in production. Plain HTML + inline styles is the
 * most reliable transactional-email format anyway: every client
 * understands it, no webfonts, no CSS-in-JS surprises.
 */

type Props = {
  driveUrl: string;
  hasApp: boolean;
  activationUrl: string | null;
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderCoursePurchaseEmailHtml({
  driveUrl,
  hasApp,
  activationUrl,
}: Props): string {
  const safeDriveUrl = esc(driveUrl);
  const safeActivationUrl = activationUrl ? esc(activationUrl) : null;

  const trialBlock =
    hasApp && safeActivationUrl
      ? `
    <hr style="border:none;border-top:1px solid #E8E4D8;margin:40px 0" />
    <h2 style="font-family:Georgia,serif;font-style:italic;font-size:28px;color:#1A1A1A;margin:0 0 16px;font-weight:400;line-height:1.1">
      Et l&rsquo;application&nbsp;?
    </h2>
    <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;color:#333333;line-height:1.65;margin:0 0 20px">
      Tu as aussi choisi l&rsquo;accès à l&rsquo;application Quranlab.
      Crée ton compte en un clic, ton abonnement sera activé
      automatiquement.
    </p>
    <div style="text-align:center;margin:32px 0 12px">
      <a href="${safeActivationUrl}"
         style="background-color:#E85D3C;color:#FFFFFF;padding:16px 36px;border-radius:999px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-weight:600;font-size:15px;letter-spacing:0.02em;display:inline-block">
        Créer mon compte premium
      </a>
    </div>
    <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#999999;line-height:1.5;margin:16px 0 0;text-align:center">
      Utilise la même adresse que celle-ci pour que l&rsquo;abonnement
      soit lié automatiquement.
    </p>
  `
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Ton pack 85% des mots du Coran est prêt</title>
  </head>
  <body style="background-color:#F5F1E8;font-family:Georgia,'Times New Roman',Times,serif;margin:0;padding:48px 20px 32px">
    <!-- Preview text (hidden) -->
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">
      Ton pack 85% des mots du Coran est prêt. Un clic pour y accéder.
    </div>

    <div style="background-color:#FFFFFF;max-width:560px;margin:0 auto;padding:48px 44px;border-radius:20px;border:1px solid #E8E4D8;box-shadow:0 20px 40px -30px rgba(26,26,26,0.12)">

      <!-- Brand monogram + kicker -->
      <div style="text-align:center;margin-bottom:32px">
        <div style="display:inline-block;width:60px;height:60px;line-height:60px;background-color:#6967fb;color:#F5F1E8;border-radius:14px;font-size:30px;font-weight:700;font-family:Georgia,serif;text-align:center;vertical-align:middle">
          Q
        </div>
        <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.28em;color:#1A1A1A;font-weight:600;margin:14px 0 0;text-align:center">
          QURANLAB
        </p>
      </div>

      <!-- Serif italic headline -->
      <h1 style="font-family:Georgia,serif;font-style:italic;font-size:44px;line-height:1.05;color:#1A1A1A;margin:0 0 28px;text-align:center;font-weight:400">
        Ton pack est prêt.
      </h1>

      <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;color:#1A1A1A;font-weight:500;line-height:1.6;margin:0 0 12px">
        Assalamu alaikum,
      </p>

      <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;color:#333333;line-height:1.65;margin:0 0 20px">
        Merci pour ta confiance. Ton pack
        <strong>85% des mots du Coran</strong> est disponible en un clic
        ci-dessous.
      </p>

      <!-- Primary CTA -->
      <div style="text-align:center;margin:32px 0 12px">
        <a href="${safeDriveUrl}"
           style="background-color:#1A1A1A;color:#F5F1E8;padding:16px 36px;border-radius:999px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-weight:600;font-size:15px;letter-spacing:0.02em;display:inline-block">
          Accéder à mes documents &rarr;
        </a>
      </div>

      <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#999999;line-height:1.5;margin:16px 0 0;text-align:center">
        Si le bouton ne fonctionne pas, copie ce lien&nbsp;:<br />
        <a href="${safeDriveUrl}" style="color:#6967fb;word-break:break-all">${safeDriveUrl}</a>
      </p>

      ${trialBlock}

      <hr style="border:none;border-top:1px solid #E8E4D8;margin:40px 0" />

      <!-- Signature -->
      <p style="font-family:Georgia,serif;font-style:italic;font-size:18px;color:#1A1A1A;text-align:center;margin:0 0 8px;font-weight:400">
        Qu&rsquo;Allah te facilite l&rsquo;apprentissage.
      </p>
      <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:#666666;text-align:center;margin:0">
        &mdash; L&rsquo;équipe Quranlab
      </p>

      <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#999999;text-align:center;margin:28px 0 0;line-height:1.5">
        Une question&nbsp;? Réponds directement à cet email, on lit tout.
      </p>

    </div>

    <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#999999;text-align:center;margin:24px 0 0">
      quranlab.app &middot; comprends le Coran
    </p>
  </body>
</html>`;
}
