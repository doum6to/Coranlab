/**
 * Shared premium email shell for Quranlab transactional emails.
 * All templates call `buildEmail()` with their own title + middle HTML.
 * Pure string output → bypasses @react-email rendering which has been
 * throwing "t is not a function" under the current Next/Resend combo.
 */

type BuildParams = {
  /** Short preview line shown by email clients in the inbox list. */
  preview: string;
  /** Serif italic headline at the top of the card. */
  heading: string;
  /** The body HTML (paragraphs, buttons, etc.) rendered inside the card. */
  bodyHtml: string;
  /** Optional italic-serif sign-off line above "— L'équipe Quranlab". */
  signoff?: string;
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Public logo URL. Must be an absolute URL because emails are opened
// outside of the Next.js app context. Next.js serves /public/* at the
// site root, so /quranlab-logo.png resolves to the site's logo PNG.
const LOGO_URL =
  (process.env.NEXT_PUBLIC_APP_URL || "https://www.quranlab.app") +
  "/quranlab-logo.png";

export function buildEmail({
  preview,
  heading,
  bodyHtml,
  signoff = "Qu'Allah te facilite l'apprentissage.",
}: BuildParams): string {
  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${esc(heading)}</title>
  </head>
  <body style="background-color:#F5F1E8;font-family:Georgia,'Times New Roman',Times,serif;margin:0;padding:48px 20px 32px">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(preview)}</div>

    <div style="background-color:#FFFFFF;max-width:560px;margin:0 auto;padding:48px 44px;border-radius:20px;border:1px solid #E8E4D8;box-shadow:0 20px 40px -30px rgba(26,26,26,0.12)">

      <div style="text-align:center;margin-bottom:32px">
        <a href="https://www.quranlab.app" style="text-decoration:none;display:inline-block">
          <img src="${LOGO_URL}" alt="Quranlab" width="180" height="auto" style="display:block;max-width:180px;height:auto;border:0;margin:0 auto" />
        </a>
      </div>

      <h1 style="font-family:Georgia,serif;font-style:italic;font-size:40px;line-height:1.05;color:#1A1A1A;margin:0 0 28px;text-align:center;font-weight:400">
        ${esc(heading)}
      </h1>

      ${bodyHtml}

      <hr style="border:none;border-top:1px solid #E8E4D8;margin:40px 0" />

      <p style="font-family:Georgia,serif;font-style:italic;font-size:18px;color:#1A1A1A;text-align:center;margin:0 0 8px;font-weight:400">
        ${esc(signoff)}
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

/** Generic inline button. */
export function buttonHtml(params: {
  href: string;
  label: string;
  variant?: "dark" | "coral";
}): string {
  const bg = params.variant === "coral" ? "#E85D3C" : "#1A1A1A";
  const fg = "#F5F1E8";
  return `<div style="text-align:center;margin:32px 0 12px">
    <a href="${esc(params.href)}"
       style="background-color:${bg};color:${fg};padding:16px 36px;border-radius:999px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-weight:600;font-size:15px;letter-spacing:0.02em;display:inline-block">
      ${esc(params.label)}
    </a>
  </div>`;
}

/** Paragraph in the body style. */
export function pHtml(text: string, options?: { bold?: boolean }): string {
  const weight = options?.bold ? 500 : 400;
  const color = options?.bold ? "#1A1A1A" : "#333333";
  return `<p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;color:${color};font-weight:${weight};line-height:1.65;margin:0 0 20px">${text}</p>`;
}

/** Small muted fineprint. */
export function fineHtml(text: string): string {
  return `<p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#999999;line-height:1.5;margin:16px 0 0;text-align:center">${text}</p>`;
}

export { esc as escapeHtml };
