import { buildEmail, buttonHtml, escapeHtml, fineHtml, pHtml } from "./_shell";
import type { LeadMagnetWord } from "@/lib/lead-magnet-content";

type Props = {
  heading: string;
  /** Intro HTML (already trusted, admin-authored). */
  introHtml: string;
  words: LeadMagnetWord[];
  ctaLabel: string;
  ctaUrl: string;
  unsubscribeUrl: string;
  preview?: string;
};

/** Renders the free "20 words" lead-magnet email as a styled table. */
export function renderLeadMagnetEmailHtml({
  heading,
  introHtml,
  words,
  ctaLabel,
  ctaUrl,
  unsubscribeUrl,
  preview,
}: Props): string {
  const rows = words
    .filter((w) => w.arabic || w.translit || w.fr)
    .map((w) => {
      const ar = escapeHtml(w.arabic);
      const tr = escapeHtml(w.translit);
      const fr = escapeHtml(w.fr);
      return `<tr>
        <td style="padding:12px 14px;border-bottom:1px solid #EFEBDF;font-family:Georgia,serif;font-size:22px;color:#1A1A1A;text-align:right;direction:rtl;white-space:nowrap">${ar}</td>
        <td style="padding:12px 14px;border-bottom:1px solid #EFEBDF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#6967fb;white-space:nowrap">${tr}</td>
        <td style="padding:12px 14px;border-bottom:1px solid #EFEBDF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;color:#333333">${fr}</td>
      </tr>`;
    })
    .join("\n");

  const table = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 8px;border:1px solid #EFEBDF;border-radius:12px;overflow:hidden">
    <tbody>${rows}</tbody>
  </table>`;

  const body = [
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;color:#333333;line-height:1.65;margin:0 0 20px">${introHtml}</div>`,
    table,
    pHtml(
      "Tu veux les <strong>500 mots</strong> (85% du Coran) + l'app pour les mémoriser sans effort&nbsp;?",
    ),
    buttonHtml({ href: ctaUrl, label: ctaLabel, variant: "coral" }),
    fineHtml(
      `Tu reçois cet email car tu as demandé les mots gratuits sur quranlab.app.<br/><a href="${escapeHtml(
        unsubscribeUrl,
      )}" style="color:#999999">Se désabonner</a>`,
    ),
  ].join("\n");

  return buildEmail({
    preview: preview || "Tes premiers mots du Coran, avec leur sens.",
    heading,
    bodyHtml: body,
  });
}
