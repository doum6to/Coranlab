"use client";

import { useEffect, useState } from "react";

import { getRetention } from "@/actions/retention";
import type { Rate, RetentionReport } from "@/lib/retention";

const pct = (r: Rate) => (r.eligible > 0 ? `${Math.round((r.back / r.eligible) * 100)} %` : "–");
const date = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

function Figure({ label, hint, rate }: { label: string; hint: string; rate: Rate }) {
  return (
    <div className="rounded-xl bg-neutral-50 p-4">
      <p className="text-sm font-semibold text-neutral-900">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums text-neutral-900">{pct(rate)}</p>
      <p className="mt-1 text-xs leading-snug text-neutral-500">{hint}</p>
      <p className="mt-2 text-xs tabular-nums text-neutral-500">{rate.eligible > 0 ? `${rate.back} sur ${rate.eligible} apprenants` : "Pas encore assez de recul"}</p>
    </div>
  );
}

/**
 * Retention: how many learners come back after their first lesson. The figures every change
 * meant to bring people back should be judged on.
 */
export function RetentionPanel() {
  const [report, setReport] = useState<RetentionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void getRetention().then((r) => ("error" in r ? setError(r.error) : setReport(r)));
  }, []);

  return (
    <div className="max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-bold text-neutral-900">Rétention</h2>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">
        Combien d&apos;apprenants reviennent après leur première leçon terminée (site et app iPhone). Un jour compte dès qu&apos;une leçon y est finie.
      </p>

      {!report && !error && <p className="mt-4 text-sm text-neutral-500">Calcul en cours…</p>}
      {error && <p className="mt-4 text-sm font-semibold text-red-600" role="alert">{error}</p>}

      {report && (
        <>
          <h3 className="mt-6 text-sm font-bold text-neutral-900">Premières leçons des 90 derniers jours</h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <Figure label="J1 : le lendemain" hint="Ont refait une leçon le jour suivant leur première." rate={report.recent.d1} />
            <Figure label="J7 : la 2e semaine" hint="Ont refait une leçon entre le 7e et le 13e jour." rate={report.recent.d7} />
            <Figure label="J30 : la 5e semaine" hint="Ont refait une leçon entre le 30e et le 36e jour." rate={report.recent.d30} />
          </div>
          <p className="mt-2 text-xs tabular-nums text-neutral-500">
            Depuis le début ({report.learners} apprenants{report.since ? `, premier jour enregistré le ${date(report.since)}` : ""}) : J1 {pct(report.overall.d1)}, J7 {pct(report.overall.d7)}, J30 {pct(report.overall.d30)}.
          </p>

          <h3 className="mt-6 text-sm font-bold text-neutral-900">Apprenants actifs</h3>
          <dl className="mt-2 grid grid-cols-3 gap-3 text-center">
            {[["Aujourd'hui", report.active.today], ["7 derniers jours", report.active.week], ["30 derniers jours", report.active.month]].map(([label, value]) => (
              <div key={label as string} className="rounded-xl bg-neutral-50 p-3">
                <dd className="text-2xl font-extrabold tabular-nums text-neutral-900">{value}</dd>
                <dt className="mt-0.5 text-xs text-neutral-500">{label}</dt>
              </div>
            ))}
          </dl>
          {report.activation && (
            <p className="mt-3 text-sm text-neutral-700">
              Comptes créés sur 30 jours : <strong className="tabular-nums">{report.activation.signups}</strong>, dont{" "}
              <strong className="tabular-nums">{report.activation.started}</strong> ont terminé au moins une leçon
              {report.activation.signups > 0 ? ` (${Math.round((report.activation.started / report.activation.signups) * 100)} %)` : ""}.
            </p>
          )}

          <h3 className="mt-6 text-sm font-bold text-neutral-900">Par semaine de première leçon</h3>
          {report.weeks.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">Aucune première leçon sur les 12 dernières semaines.</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm tabular-nums">
                <thead className="text-xs text-neutral-500">
                  <tr><th className="py-2 pr-3 font-semibold">Semaine du</th><th className="py-2 pr-3 text-right font-semibold">Nouveaux</th><th className="py-2 pr-3 text-right font-semibold">J1</th><th className="py-2 pr-3 text-right font-semibold">J7</th><th className="py-2 text-right font-semibold">J30</th></tr>
                </thead>
                <tbody>
                  {report.weeks.map((w) => (
                    <tr key={w.week} className="border-t border-neutral-100">
                      <td className="py-2 pr-3 text-neutral-900">{date(w.week)}</td>
                      <td className="py-2 pr-3 text-right text-neutral-900">{w.size}</td>
                      <td className="py-2 pr-3 text-right text-neutral-700">{pct(w.d1)}</td>
                      <td className="py-2 pr-3 text-right text-neutral-700">{pct(w.d7)}</td>
                      <td className="py-2 text-right text-neutral-700">{pct(w.d30)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs leading-relaxed text-neutral-500">
            Un tiret : le groupe n&apos;a pas encore le recul nécessaire. Avec peu d&apos;apprenants dans un groupe, un pourcentage bouge beaucoup d&apos;une semaine à l&apos;autre : regarde la ligne des 90 jours avant de conclure.
          </p>
        </>
      )}
    </div>
  );
}
