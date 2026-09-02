import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { funnelLead } from "@/db/schema";
import { verifyEmailToken } from "@/lib/leads/unsub";

export const dynamic = "force-dynamic";

function page(title: string, message: string): Response {
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#F5F1E8;margin:0;padding:64px 20px;text-align:center;color:#1A1A1A">
<div style="max-width:440px;margin:0 auto;background:#fff;border:1px solid #E8E4D8;border-radius:20px;padding:40px 32px">
<h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
<p style="font-size:15px;line-height:1.6;color:#555;margin:0">${message}</p>
<p style="margin:28px 0 0"><a href="https://www.quranlab.app" style="color:#6967fb;font-weight:600;text-decoration:none">Retour sur Quranlab →</a></p>
</div></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/** One-click unsubscribe from lead (drip) emails. Gated by a signed token. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("e") || "").trim().toLowerCase();
  const token = url.searchParams.get("t") || "";

  if (!email || !verifyEmailToken(email, token)) {
    return page("Lien invalide", "Ce lien de désabonnement n'est pas valide ou a expiré.");
  }

  try {
    await db
      .update(funnelLead)
      .set({ unsubscribed: true, nurtureNextAt: null, updatedAt: new Date() })
      .where(eq(funnelLead.email, email));
  } catch (e) {
    console.error("[leads/unsubscribe] update failed:", e);
    return page(
      "Une erreur est survenue",
      "Impossible de te désabonner pour le moment. Réponds simplement à l'email et on s'en occupe.",
    );
  }

  return page(
    "Tu es désabonné(e) ✓",
    "Tu ne recevras plus nos emails de suivi. Qu'Allah te facilite l'apprentissage.",
  );
}

/** Some email clients issue a POST for one-click unsubscribe (RFC 8058). */
export const POST = GET;
