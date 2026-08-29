"use client";

import { useState, useTransition } from "react";

import { updateApprendreCoranContent } from "@/actions/apprendre-coran-content";
import { compressImageFile } from "@/lib/images/compress-client";
import type {
  ApprendreCoranContent,
  OnbStep,
  OnbPlan,
} from "@/lib/apprendre-coran-content";

const input = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green";
const lbl = "block text-xs font-semibold text-neutral-500 mb-1";

/**
 * Uploads an image chosen from the admin's computer. Always compresses to a
 * light WebP first (max 1600px, q0.85) so the stored file is small → fast page
 * load, without a visible quality loss. Returns the public URL.
 */
async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", await compressImageFile(file, 1600, 0.85));
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const text = await res.text();
  let data: { url?: string; error?: string } = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text.slice(0, 140) || `Erreur ${res.status}` };
  }
  if (res.status === 413) throw new Error("Image trop lourde.");
  if (!res.ok || !data.url) throw new Error(data.error || `Erreur ${res.status}`);
  return data.url;
}

/** URL text field + "upload from computer" button + thumbnail preview. */
function ImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input className={input} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… (ou téléverse)" />
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-10 w-10 shrink-0 rounded object-cover border border-neutral-200" />
        )}
      </div>
      <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-brilliant-green hover:underline">
        {busy ? "Compression + upload…" : "📤 Téléverser depuis mon PC"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={busy}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setErr(null);
            setBusy(true);
            try {
              onChange(await uploadImage(f));
            } catch (er: any) {
              setErr(er?.message || "Échec de l'upload.");
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {err && <span className="ml-2 text-xs text-rose-500">{err}</span>}
    </div>
  );
}

export function ApprendreCoranForm({ initial }: { initial: ApprendreCoranContent }) {
  const [content, setContent] = useState<ApprendreCoranContent>(initial);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState("");

  const patchStep = (i: number, patch: Partial<OnbStep>) =>
    setContent((c) => ({ ...c, steps: c.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  const patchPaywall = (patch: Partial<ApprendreCoranContent["paywall"]>) =>
    setContent((c) => ({ ...c, paywall: { ...c.paywall, ...patch } }));
  const patchPlan = (which: "weekly" | "annual", patch: Partial<OnbPlan>) =>
    setContent((c) => ({ ...c, paywall: { ...c.paywall, [which]: { ...c.paywall[which], ...patch } } }));

  const save = () =>
    start(async () => {
      setStatus("");
      const r = await updateApprendreCoranContent(content);
      setStatus(r && "ok" in r && r.ok ? "Enregistré ✓" : (r as any)?.error || "Erreur");
    });

  const lines = (v?: string[]) => (v ?? []).join("\n");
  const toLines = (v: string) => v.split("\n");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-800">Onboarding /apprendre-coran</h2>
          <p className="text-sm text-neutral-500">Modifie les textes, images (URL) et prix de l&apos;onboarding.</p>
        </div>
        <div className="flex items-center gap-3">
          {status && <span className="text-sm text-neutral-600">{status}</span>}
          <button onClick={save} disabled={pending} className="rounded-xl bg-brilliant-green px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            {pending ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* ---------- Paywall & prix ---------- */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h3 className="mb-3 font-bold text-neutral-800">Paywall &amp; prix</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={lbl}>Titre (retour à la ligne = \n)</label>
            <textarea className={input} rows={2} value={content.paywall.title} onChange={(e) => patchPaywall({ title: e.target.value })} />
          </div>
          <div>
            <label className={lbl}>Image</label>
            <ImageField value={content.paywall.image} onChange={(url) => patchPaywall({ image: url })} />
          </div>
          <div>
            <label className={lbl}>Réassurance</label>
            <input className={input} value={content.paywall.reassurance} onChange={(e) => patchPaywall({ reassurance: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Bénéfices (un par ligne)</label>
            <textarea className={input} rows={3} value={lines(content.paywall.bullets)} onChange={(e) => patchPaywall({ bullets: toLines(e.target.value) })} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(["weekly", "annual"] as const).map((which) => {
            const p = content.paywall[which];
            return (
              <div key={which} className="rounded-xl border border-neutral-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-700">{which === "weekly" ? "Plan hebdo" : "Plan annuel"}</span>
                  <label className="flex items-center gap-1 text-xs text-neutral-500">
                    <input type="checkbox" checked={p.popular} onChange={(e) => patchPlan(which, { popular: e.target.checked })} /> populaire
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={lbl}>Montant facturé (€)</label>
                    <input className={input} type="number" step="0.01" value={(p.amountCents / 100).toString()} onChange={(e) => patchPlan(which, { amountCents: Math.round((parseFloat(e.target.value) || 0) * 100) })} />
                  </div>
                  <div>
                    <label className={lbl}>Intervalle Stripe</label>
                    <select className={input} value={p.interval} onChange={(e) => patchPlan(which, { interval: e.target.value as OnbPlan["interval"] })}>
                      <option value="week">semaine</option>
                      <option value="year">année</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Titre affiché</label>
                    <input className={input} value={p.title} onChange={(e) => patchPlan(which, { title: e.target.value })} />
                  </div>
                  <div>
                    <label className={lbl}>Prix affiché</label>
                    <input className={input} value={p.priceLabel} onChange={(e) => patchPlan(which, { priceLabel: e.target.value })} placeholder="8,99€" />
                  </div>
                  <div>
                    <label className={lbl}>Unité (« par semaine »)</label>
                    <input className={input} value={p.per} onChange={(e) => patchPlan(which, { per: e.target.value })} />
                  </div>
                  <div>
                    <label className={lbl}>Sous-texte</label>
                    <input className={input} value={p.sub} onChange={(e) => patchPlan(which, { sub: e.target.value })} placeholder="Facturé 89,99€ par an" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          « Montant facturé » = ce que Stripe prélève réellement (l&apos;annuel prélève 89,99€/an mais peut afficher « 1,73€ / semaine »).
        </p>
      </section>

      {/* ---------- Écrans ---------- */}
      <section className="space-y-3">
        <h3 className="font-bold text-neutral-800">Écrans ({content.steps.length})</h3>
        {content.steps.map((st, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
              #{i + 1} · {st.type}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {st.headline !== undefined && (
                <div className="sm:col-span-2">
                  <label className={lbl}>Titre (retour à la ligne = \n)</label>
                  <textarea className={input} rows={2} value={st.headline} onChange={(e) => patchStep(i, { headline: e.target.value })} />
                </div>
              )}
              {st.sub !== undefined && (
                <div className="sm:col-span-2">
                  <label className={lbl}>Sous-titre</label>
                  <input className={input} value={st.sub} onChange={(e) => patchStep(i, { sub: e.target.value })} />
                </div>
              )}
              {st.image !== undefined && (
                <div className="sm:col-span-2">
                  <label className={lbl}>Image (vide = placeholder)</label>
                  <ImageField value={st.image} onChange={(url) => patchStep(i, { image: url })} />
                </div>
              )}
              {st.cta !== undefined && (
                <div>
                  <label className={lbl}>Bouton (CTA)</label>
                  <input className={input} value={st.cta} onChange={(e) => patchStep(i, { cta: e.target.value })} />
                </div>
              )}
              {st.big !== undefined && (
                <div>
                  <label className={lbl}>Chiffre mis en avant</label>
                  <input className={input} value={st.big} onChange={(e) => patchStep(i, { big: e.target.value })} />
                </div>
              )}
              {st.items !== undefined && (
                <div className="sm:col-span-2">
                  <label className={lbl}>Éléments (un par ligne)</label>
                  <textarea className={input} rows={4} value={lines(st.items)} onChange={(e) => patchStep(i, { items: toLines(e.target.value) })} />
                </div>
              )}
              {st.options !== undefined && (
                <div className="sm:col-span-2">
                  <label className={lbl}>Options (une par ligne)</label>
                  <textarea className={input} rows={5} value={lines(st.options)} onChange={(e) => patchStep(i, { options: toLines(e.target.value) })} />
                </div>
              )}
              {(["left", "right"] as const).map((side) =>
                st[side] ? (
                  <div key={side} className="rounded-xl border border-neutral-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-600">Colonne {side === "left" ? "gauche" : "droite"}</span>
                      <label className="flex items-center gap-1 text-xs text-neutral-500">
                        <input type="checkbox" checked={st[side]!.good} onChange={(e) => patchStep(i, { [side]: { ...st[side]!, good: e.target.checked } } as Partial<OnbStep>)} /> ✅ positif
                      </label>
                    </div>
                    <input className={input + " mb-2"} value={st[side]!.title} onChange={(e) => patchStep(i, { [side]: { ...st[side]!, title: e.target.value } } as Partial<OnbStep>)} placeholder="Titre colonne" />
                    <textarea className={input} rows={3} value={lines(st[side]!.items)} onChange={(e) => patchStep(i, { [side]: { ...st[side]!, items: toLines(e.target.value) } } as Partial<OnbStep>)} placeholder="Un élément par ligne" />
                  </div>
                ) : null,
              )}
              {st.reviews !== undefined && (
                <div className="sm:col-span-2 space-y-2">
                  <label className={lbl}>Avis</label>
                  {st.reviews.map((r, ri) => (
                    <div key={ri} className="grid grid-cols-3 gap-2">
                      <input className={input} value={r.name} placeholder="Prénom" onChange={(e) => patchStep(i, { reviews: st.reviews!.map((x, xi) => (xi === ri ? { ...x, name: e.target.value } : x)) })} />
                      <input className={input + " col-span-2"} value={r.text} placeholder="Avis" onChange={(e) => patchStep(i, { reviews: st.reviews!.map((x, xi) => (xi === ri ? { ...x, text: e.target.value } : x)) })} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <button onClick={save} disabled={pending} className="rounded-xl bg-brilliant-green px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">
          {pending ? "…" : "Enregistrer"}
        </button>
        {status && <span className="ml-3 self-center text-sm text-neutral-600">{status}</span>}
      </div>
    </div>
  );
}
