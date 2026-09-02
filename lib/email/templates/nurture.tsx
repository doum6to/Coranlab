import { buildEmail, buttonHtml, escapeHtml, fineHtml } from "./_shell";

type Props = {
  heading: string;
  /** Body HTML (admin-authored, trusted). */
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  unsubscribeUrl: string;
  preview?: string;
};

/** Generic follow-up (drip) email: admin body + one CTA + unsubscribe. */
export function renderNurtureEmailHtml({
  heading,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  unsubscribeUrl,
  preview,
}: Props): string {
  const body = [
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;color:#333333;line-height:1.65;margin:0 0 12px">${bodyHtml}</div>`,
    buttonHtml({ href: ctaUrl, label: ctaLabel, variant: "coral" }),
    fineHtml(
      `Tu reçois cet email car tu as demandé les mots gratuits sur quranlab.app.<br/><a href="${escapeHtml(
        unsubscribeUrl,
      )}" style="color:#999999">Se désabonner</a>`,
    ),
  ].join("\n");

  return buildEmail({
    preview: preview || heading,
    heading,
    bodyHtml: body,
  });
}
