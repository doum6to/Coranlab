import { sql } from "drizzle-orm";

import db from "@/db/drizzle";

type Row = { path: string; meta: string; d7: number; d30: number };

const LABELS: Record<string, string> = {
  splash: "Écran d'ouverture",
  welcome: "Accueil Koji",
  chart: "Graphique de progression",
  time: "Temps par jour",
  social: "Avis",
  loader: "Création du plan",
  plan: "Plan personnalisé",
  email: "Email",
  lesson: "Leçon interactive",
  paywall: "Paywall",
  q_why: "Question : pourquoi",
  q_pain: "Question : ce que ça change",
  q_gender: "Question : homme / femme",
  q_level: "Question : niveau",
  q_alphabet: "Question : lire l'arabe",
  q_blockers: "Question : freins",
  q_when: "Question : quand pratiquer",
};

/**
 * Step-by-step funnel for /commencer (FR) and /start (EN): unique visitors who
 * reached each step, share of the first step, and the drop from the previous
 * one. Lets the owner see exactly where people quit before the paywall.
 */
export async function CommencerFunnelPanel() {
  let rows: Row[] = [];
  let extra: Record<string, { checkout7: number; checkout30: number; buy7: number; buy30: number }> = {};
  let error: string | null = null;

  try {
    const res: any = await db.execute(sql`
      SELECT path, meta,
        COUNT(DISTINCT session_id) FILTER (WHERE created_at > now() - interval '7 days')::int AS d7,
        COUNT(DISTINCT session_id)::int AS d30
      FROM analytics_event
      WHERE event = 'cm_step' AND created_at > now() - interval '30 days' AND meta IS NOT NULL
      GROUP BY path, meta;
    `);
    rows = ((res?.rows ?? res ?? []) as any[]).map((r) => ({ path: r.path || "?", meta: r.meta, d7: Number(r.d7) || 0, d30: Number(r.d30) || 0 }));

    const ex: any = await db.execute(sql`
      SELECT path,
        COUNT(DISTINCT session_id) FILTER (WHERE event = 'cm_checkout_start' AND created_at > now() - interval '7 days')::int AS checkout7,
        COUNT(DISTINCT session_id) FILTER (WHERE event = 'cm_checkout_start')::int AS checkout30,
        COUNT(*) FILTER (WHERE event = 'purchase' AND created_at > now() - interval '7 days')::int AS buy7,
        COUNT(*) FILTER (WHERE event = 'purchase')::int AS buy30
      FROM analytics_event
      WHERE event IN ('cm_checkout_start', 'purchase') AND path IN ('/commencer', '/start')
        AND created_at > now() - interval '30 days'
      GROUP BY path;
    `);
    for (const r of (ex?.rows ?? ex ?? []) as any[]) {
      extra[r.path] = { checkout7: Number(r.checkout7) || 0, checkout30: Number(r.checkout30) || 0, buy7: Number(r.buy7) || 0, buy30: Number(r.buy30) || 0 };
    }
  } catch (e: any) {
    error = e?.message || String(e);
  }

  if (error) return <p className="text-sm text-rose-600">Lecture impossible : {error}</p>;

  const paths = Array.from(new Set(rows.map((r) => r.path))).sort();
  if (paths.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Aucune donnée pour l&apos;instant. Les étapes sont enregistrées depuis la mise en ligne de ce suivi : reviens après quelques visites sur /commencer ou /start.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-neutral-600">
        Visiteurs uniques ayant atteint chaque étape. « Perte » = part de ceux de l&apos;étape précédente qui ne sont pas allés plus loin. Les plus grosses pertes sont les étapes à retravailler en priorité.
      </p>
      {paths.map((path) => (
        <FunnelTable key={path} path={path} rows={rows.filter((r) => r.path === path)} extra={extra[path]} />
      ))}
    </div>
  );
}

function FunnelTable({ path, rows, extra }: { path: string; rows: Row[]; extra?: { checkout7: number; checkout30: number; buy7: number; buy30: number } }) {
  const steps = rows
    .map((r) => {
      const [idx, key] = r.meta.split("|");
      return { idx: Number(idx), key: key || r.meta, d7: r.d7, d30: r.d30 };
    })
    .filter((s) => Number.isFinite(s.idx))
    .sort((a, b) => a.idx - b.idx);
  const all = [
    ...steps.map((s) => ({ label: LABELS[s.key] ?? s.key, d7: s.d7, d30: s.d30 })),
    { label: "Clic sur « Débloquer »", d7: extra?.checkout7 ?? 0, d30: extra?.checkout30 ?? 0 },
    { label: "Achat", d7: extra?.buy7 ?? 0, d30: extra?.buy30 ?? 0 },
  ];
  const first30 = all[0]?.d30 || 0;
  const first7 = all[0]?.d7 || 0;
  const pct = (n: number, base: number) => (base > 0 ? `${Math.round((n / base) * 100)} %` : "—");
  const drop = (n: number, prev: number) => (prev > 0 ? Math.max(0, Math.round((1 - n / prev) * 100)) : 0);

  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-neutral-900">{path}</h3>
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-3 py-2">Étape</th>
              <th className="px-3 py-2 text-right">30 jours</th>
              <th className="px-3 py-2 text-right">du départ</th>
              <th className="px-3 py-2 text-right">Perte</th>
              <th className="px-3 py-2 text-right">7 jours</th>
              <th className="px-3 py-2 text-right">du départ</th>
            </tr>
          </thead>
          <tbody>
            {all.map((s, i) => {
              const d = i === 0 ? 0 : drop(s.d30, all[i - 1].d30);
              return (
                <tr key={`${s.label}-${i}`} className="border-t border-neutral-100">
                  <td className="px-3 py-2">
                    <div className="font-medium text-neutral-900">{s.label}</div>
                    <div className="mt-1 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-[#6967fb]" style={{ width: first30 > 0 ? `${Math.min(100, (s.d30 / first30) * 100)}%` : "0%" }} />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{s.d30}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-neutral-500">{pct(s.d30, first30)}</td>
                  <td className={`px-3 py-2 text-right font-semibold tabular-nums ${d >= 30 ? "text-rose-600" : d >= 15 ? "text-amber-600" : "text-neutral-400"}`}>{i === 0 ? "—" : `−${d} %`}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{s.d7}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-neutral-500">{pct(s.d7, first7)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
