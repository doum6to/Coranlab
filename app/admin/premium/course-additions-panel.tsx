"use client";

import { useEffect, useState } from "react";

import { addCourseLists, getCourseAdditionsStatus } from "@/actions/course-additions";

type Status = { total: number; done: number; missing: string[]; rangesFixed: boolean; ready: boolean };

/**
 * Adds the new vocabulary lists to the live course. The work is done in steps by the server;
 * this panel calls it again until nothing is left, and shows where it stands.
 */
export function CourseAdditionsPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const s = await getCourseAdditionsStatus();
    if ("error" in s) setError(s.error);
    else setStatus(s);
  };
  useEffect(() => { void refresh(); }, []);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      for (let step = 0; step < 40; step++) {
        const out = await addCourseLists();
        if ("error" in out) { setError(out.error); break; }
        if (out.added.length) setLog((l) => [...l, ...out.added]);
        await refresh();
        if (out.remaining === 0) break;
        if (out.added.length === 0) { setError("Aucune liste ajoutée à cette étape. Relance dans un instant."); break; }
      }
    } finally {
      setRunning(false);
    }
  };

  const done = !!status && status.missing.length === 0;
  return (
    <div className="max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-lg font-bold text-neutral-900">Nouvelles listes de vocabulaire</h2>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">
        Ajoute au cours les listes préparées dans le code (pronoms, particules, noms, verbes). Rien de ce qui existe n&apos;est modifié : ni les
        leçons, ni les exercices, ni la progression des apprenants. L&apos;opération peut être interrompue et relancée sans risque.
      </p>

      {!status && !error && <p className="mt-4 text-sm text-neutral-500">Lecture de l&apos;état du cours…</p>}
      {status && !status.ready && <p className="mt-4 text-sm font-semibold text-red-600">Les parties du cours sont introuvables dans la base. Rien ne sera ajouté.</p>}

      {status && status.ready && (
        <>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tabular-nums text-neutral-900">{status.done}</span>
            <span className="text-sm text-neutral-500">listes ajoutées sur {status.total}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-[#6967FB] transition-[width] duration-300" style={{ width: `${(status.done / Math.max(1, status.total)) * 100}%` }} />
          </div>
          {done ? (
            <p className="mt-4 text-sm font-semibold text-emerald-700">
              Toutes les listes sont dans le cours{status.rangesFixed ? ", et les tranches de chaque partie sont à jour (41 %, 60 %, 85 %)." : "."}
            </p>
          ) : (
            <button type="button" onClick={run} disabled={running} className="mt-5 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white transition disabled:opacity-50">
              {running ? "Ajout en cours…" : `Ajouter les ${status.missing.length} listes restantes`}
            </button>
          )}
        </>
      )}

      {error && <p className="mt-4 text-sm font-semibold text-red-600" role="alert">{error}</p>}
      {log.length > 0 && (
        <ul className="mt-4 max-h-56 overflow-y-auto rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700">
          {log.map((t) => <li key={t}>Ajoutée : {t}</li>)}
        </ul>
      )}
    </div>
  );
}
