import { setEmailReminders, verifyReminderToken } from "@/lib/reminders";

export const dynamic = "force-dynamic";

function page(title: string, message: string): Response {
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#F7F7FB;margin:0;padding:64px 20px;text-align:center;color:#1A1A1A">
<div style="max-width:440px;margin:0 auto;background:#fff;border:1px solid #ECECF2;border-radius:24px;padding:40px 32px">
<h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
<p style="font-size:16px;line-height:1.6;color:#555;margin:0">${message}</p>
<p style="margin:28px 0 0"><a href="https://www.quranlab.app/learn" style="color:#6967fb;font-weight:600;text-decoration:none">Retour sur Quranlab</a></p>
</div></body></html>`;
  return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}

/** One-click opt-out from the reminder e-mails. The link is signed: no login needed. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("u") || "";
  const token = url.searchParams.get("t") || "";
  if (!verifyReminderToken(userId, token)) return page("Lien invalide", "Ce lien n'est pas valide. Tu peux couper les rappels depuis ton profil dans l'app.");
  try {
    await setEmailReminders(userId, false);
  } catch (e) {
    console.error("[reminders/unsubscribe] failed:", e);
    return page("Une erreur est survenue", "Impossible de couper les rappels pour le moment. Réponds simplement à l'e-mail et on s'en occupe.");
  }
  return page("C'est noté", "Tu ne recevras plus d'e-mails de rappel. Tu peux les réactiver à tout moment depuis ton profil.");
}

/** Mail clients send a POST for the one-click unsubscribe (RFC 8058). */
export const POST = GET;
