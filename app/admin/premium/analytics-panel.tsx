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

  // Funnel (V5) lead stats — counts unique captured emails + furthest step.
  let leadStats = { total: 0, ex: 0, offer: 0, checkout: 0 };
  let recentLeads: Array<{
    email: string;
    first_name: string | null;
    focus_choice: string | null;
    reached_exercise: boolean;
    reached_offer: boolean;
    started_checkout: boolean;
    created_at: string;
  }> = [];
  try {
    const r1: any = await db.execute(sql`
      SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE reached_exercise)::int AS ex,
             COUNT(*) FILTER (WHERE reached_offer)::int AS offer,
             COUNT(*) FILTER (WHERE started_checkout)::int AS checkout
      FROM funnel_lead;
    `);
    const row = (r1?.rows ?? r1 ?? [])[0];
    if (row) {
      leadStats = {
        total: Number(row.total) || 0,
        ex: Number(row.ex) || 0,
        offer: Number(row.offer) || 0,
        checkout: Number(row.checkout) || 0,
      };
    }
    const r2: any = await db.execute(sql`
      SELECT email, first_name, focus_choice, reached_exercise, reached_offer, started_checkout, created_at
      FROM funnel_lead ORDER BY created_at DESC LIMIT 30;
    `);
    recentLeads = r2?.rows ?? r2 ?? [];
  } catch {
    /* funnel_lead table may not exist yet — skip silently */
  }

  const n = (k: string) => counts[k] ?? 0;
  const views = n("lp_view");
  const pct = (v: number) => (views > 0 ? Math.round((v / views) * 100) : 0);

  // Funnel (V5) conversion, measured from its own events.
  const fView = n("funnel_view");
  const fPctBase = fView > 0 ? fView : leadStats.total;
  const fPct = (v: number) => (fPctBase > 0 ? Math.round((v / fPctBase) * 100) : 0);
  const funnelV5 = [
    { label: "Vues du tunnel", value: fView, hint: "ont ouvert le tunnel" },
    { label: "Email saisi", value: Math.max(n("funnel_lead"), leadStats.total), hint: "ont laissé leur email" },
    { label: "Exercice réussi", value: Math.max(n("funnel_exercise_done"), leadStats.ex), hint: "1er mot appris" },
    { label: "Offre vue", value: Math.max(n("funnel_offer_view"), leadStats.offer), hint: "ont vu le prix" },
    { label: "Paiement démarré", value: Math.max(n("funnel_checkout_start"), leadStats.checkout), hint: "redirigés vers Stripe" },
  ];

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

      {/* Funnel (V5) — try-before-you-buy */}
      <div className="mt-8 border-t border-neutral-200 pt-6">
        <h2 className="text-lg font-bold text-neutral-800">
          Tunnel « teste gratuitement » (V5)
        </h2>
        <p className="mb-4 text-sm text-neutral-500">
          Parcours capture → onboarding → exercice → offre → paiement.
        </p>

        {fView === 0 && leadStats.total === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            Pas encore de données. Elles apparaîtront dès les premières visites
            du tunnel (variante « Tunnel (V5) » activée).
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-5">
              {funnelV5.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-center"
                >
                  <p className="text-2xl font-extrabold text-neutral-900">
                    {s.value.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-xs font-semibold text-[#58cc6a]">
                    {fPct(s.value)}%
                  </p>
                  <p className="mt-1 text-xs font-medium text-neutral-700">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-neutral-400 leading-tight">
                    {s.hint}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent leads */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-neutral-700">
                Derniers leads ({leadStats.total.toLocaleString("fr-FR")} au total)
              </p>
              {recentLeads.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  Aucun email capturé pour l&apos;instant.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-neutral-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Prénom</th>
                        <th className="px-3 py-2 font-semibold">Email</th>
                        <th className="px-3 py-2 font-semibold">Objectif (choix)</th>
                        <th className="px-3 py-2 font-semibold">Étape atteinte</th>
                        <th className="px-3 py-2 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLeads.map((l, i) => {
                        const stage = l.started_checkout
                          ? "Paiement"
                          : l.reached_offer
                            ? "Offre"
                            : l.reached_exercise
                              ? "Exercice"
                              : "Email";
                        return (
                          <tr key={i} className="border-t border-neutral-100">
                            <td className="px-3 py-2 text-neutral-700">
                              {l.first_name || "—"}
                            </td>
                            <td className="px-3 py-2 text-neutral-700">{l.email}</td>
                            <td className="px-3 py-2 text-neutral-600">
                              {l.focus_choice || "—"}
                            </td>
                            <td className="px-3 py-2">
                              <span className="rounded-full bg-[#6967fb]/10 px-2 py-0.5 text-xs font-semibold text-[#6967fb]">
                                {stage}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-neutral-400">
                              {l.created_at
                                ? new Date(l.created_at).toLocaleDateString("fr-FR")
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <p className="mt-5 text-xs text-neutral-400 leading-relaxed">
        Pour les cartes de chaleur, les cartes de scroll et le replay des
        sessions, ouvre Microsoft Clarity (clarity.microsoft.com) — actif si la
        variable <code>NEXT_PUBLIC_CLARITY_ID</code> est définie sur Vercel.
      </p>
    </div>
  );
}
