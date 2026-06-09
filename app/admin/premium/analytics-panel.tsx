import { sql } from "drizzle-orm";

import db from "@/db/drizzle";

/**
 * Admin behavior dashboard for the landing (/offre-a-vie). Reads the
 * analytics_event table and shows a conversion funnel + per-event counts over
 * the last 30 days. Resilient: if the table doesn't exist yet, shows a hint.
 */
export async function AnalyticsPanel() {
  let counts: Record<string, number> = {};
  let error: string | null = null;

  try {
    const res: any = await db.execute(sql`
      SELECT event, COUNT(*)::int AS n
      FROM analytics_event
      WHERE created_at > now() - interval '30 days'
      GROUP BY event;
    `);
    const rows: any[] = res?.rows ?? res ?? [];
    for (const r of rows) counts[r.event] = Number(r.n) || 0;
  } catch (e: any) {
    error = e?.message || String(e);
  }

  const n = (k: string) => counts[k] ?? 0;
  const views = n("lp_view");
  const pct = (v: number) => (views > 0 ? Math.round((v / views) * 100) : 0);

  const funnel = [
    { label: "Visites", value: views, hint: "Pages vues" },
    { label: "Scroll 50%", value: n("lp_scroll_50"), hint: "ont scrollé à mi-page" },
    { label: "Scroll 100%", value: n("lp_scroll_100"), hint: "ont vu le bas" },
    { label: "Clic CTA", value: n("lp_cta_click"), hint: "ont cliqué « acheter »" },
    { label: "Paiement démarré", value: n("lp_checkout_start"), hint: "redirigés vers Stripe" },
  ];

  const details = [
    { label: "Scroll 25%", value: n("lp_scroll_25") },
    { label: "Scroll 75%", value: n("lp_scroll_75") },
    { label: "Galerie ouverte (clic image)", value: n("lp_gallery_open") },
    { label: "Avis vus (carrousel)", value: n("lp_reviews_view") },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-neutral-800">
        Comportement des visiteurs — /offre-a-vie
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        30 derniers jours. Entonnoir de la visite jusqu&apos;au paiement.
      </p>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Données indisponibles. La table n&apos;existe peut-être pas encore —
          ouvre <code>/api/admin/db-setup?token=…</code> une fois, puis recharge.
        </div>
      ) : views === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
          Pas encore de données sur 30 jours. Les statistiques apparaîtront dès
          les premières visites après le déploiement.
        </div>
      ) : (
        <>
          {/* Funnel */}
          <div className="grid gap-3 sm:grid-cols-5">
            {funnel.map((step) => (
              <div
                key={step.label}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-center"
              >
                <p className="text-2xl font-extrabold text-neutral-900">
                  {step.value.toLocaleString("fr-FR")}
                </p>
                <p className="text-xs font-semibold text-[#6967fb]">
                  {pct(step.value)}%
                </p>
                <p className="mt-1 text-xs font-medium text-neutral-700">
                  {step.label}
                </p>
                <p className="mt-0.5 text-[10px] text-neutral-400 leading-tight">
                  {step.hint}
                </p>
              </div>
            ))}
          </div>

          {/* Detail counts */}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {details.map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-2.5"
              >
                <span className="text-sm text-neutral-700">{d.label}</span>
                <span className="text-sm font-bold text-neutral-900">
                  {d.value.toLocaleString("fr-FR")}{" "}
                  <span className="text-xs font-normal text-neutral-400">
                    ({pct(d.value)}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-5 text-xs text-neutral-400 leading-relaxed">
        Pour les cartes de chaleur, les cartes de scroll et le replay des
        sessions, ouvre Microsoft Clarity (clarity.microsoft.com) — actif si la
        variable <code>NEXT_PUBLIC_CLARITY_ID</code> est définie sur Vercel.
      </p>
    </div>
  );
}
