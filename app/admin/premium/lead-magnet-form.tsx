"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateLeadMagnetContent } from "@/actions/lead-magnet-content";
import type { LeadMagnetContent } from "@/lib/lead-magnet-content";

const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>
      {children}
    </label>
  );
}

/** Admin editor for the free lead-magnet email (words) + the follow-up drip. */
export function LeadMagnetForm({ initial }: { initial: LeadMagnetContent }) {
  const [c, setC] = useState<LeadMagnetContent>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const save = () =>
    start(async () => {
      setMsg(null);
      const res = await updateLeadMagnetContent(c);
      if (res && "error" in res && res.error) {
        setMsg({ ok: false, text: res.error });
      } else {
        setMsg({ ok: true, text: "Enregistré ✓" });
        router.refresh();
      }
    });

  return (
    <div className="space-y-6">
      <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        ⚠️ Vérifie bien les mots arabes, translittérations et traductions avant de diffuser
        (exactitude religieuse). Le texte d&apos;intro et les emails de relance acceptent du
        HTML simple (&lt;p&gt;, &lt;strong&gt;, &lt;br/&gt;).
      </p>

      {/* CAPTURE WIDGET */}
      <section className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="text-sm font-bold text-neutral-800">Widget de capture (sur la page)</h3>
        <Field label="Titre">
          <input value={c.captureHeading} onChange={(e) => setC({ ...c, captureHeading: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Sous-texte">
          <input value={c.captureSubtext} onChange={(e) => setC({ ...c, captureSubtext: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Texte du bouton">
          <input value={c.captureButton} onChange={(e) => setC({ ...c, captureButton: e.target.value })} className={inputCls} />
        </Field>
      </section>

      {/* LEAD-MAGNET EMAIL */}
      <section className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="text-sm font-bold text-neutral-800">Email « mots gratuits »</h3>
        <Field label="Objet de l'email">
          <input value={c.emailSubject} onChange={(e) => setC({ ...c, emailSubject: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Titre dans l'email">
          <input value={c.emailHeading} onChange={(e) => setC({ ...c, emailHeading: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Intro (HTML simple)">
          <textarea rows={4} value={c.emailIntro} onChange={(e) => setC({ ...c, emailIntro: e.target.value })} className={inputCls} />
        </Field>

        <div className="space-y-2">
          <span className="block text-xs font-semibold text-neutral-600">
            Les mots (arabe · translittération · français)
          </span>
          {c.words.map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                dir="rtl"
                value={w.arabic}
                onChange={(e) => {
                  const words = [...c.words];
                  words[i] = { ...w, arabic: e.target.value };
                  setC({ ...c, words });
                }}
                placeholder="عربي"
                className={`${inputCls} w-24 text-right`}
              />
              <input
                value={w.translit}
                onChange={(e) => {
                  const words = [...c.words];
                  words[i] = { ...w, translit: e.target.value };
                  setC({ ...c, words });
                }}
                placeholder="Translittération"
                className={inputCls}
              />
              <input
                value={w.fr}
                onChange={(e) => {
                  const words = [...c.words];
                  words[i] = { ...w, fr: e.target.value };
                  setC({ ...c, words });
                }}
                placeholder="Français"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setC({ ...c, words: c.words.filter((_, j) => j !== i) })}
                className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-neutral-200 hover:text-red-600"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setC({ ...c, words: [...c.words, { arabic: "", translit: "", fr: "" }] })}
            className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"
          >
            <Plus className="h-3.5 w-3.5" /> Ajouter un mot
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Texte du bouton (vers l'offre)">
            <input value={c.ctaLabel} onChange={(e) => setC({ ...c, ctaLabel: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Lien du bouton (ex. /coran)">
            <input value={c.ctaUrl} onChange={(e) => setC({ ...c, ctaUrl: e.target.value })} className={inputCls} />
          </Field>
        </div>
      </section>

      {/* NURTURE SEQUENCE */}
      <section className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="text-sm font-bold text-neutral-800">Séquence de relance (emails de suivi)</h3>
        <p className="text-xs text-neutral-500">
          Envoyés automatiquement chaque jour aux leads qui n&apos;ont pas acheté. « Délai » =
          nombre de jours après l&apos;email précédent.
        </p>
        {c.nurture.map((n, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Email {i + 1}</span>
              <button
                type="button"
                onClick={() => setC({ ...c, nurture: c.nurture.filter((_, j) => j !== i) })}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
                aria-label="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Délai (jours)</span>
              <input
                type="number"
                min={0}
                value={n.delayDays}
                onChange={(e) => {
                  const nurture = [...c.nurture];
                  nurture[i] = { ...n, delayDays: Number(e.target.value) || 0 };
                  setC({ ...c, nurture });
                }}
                className={`${inputCls} w-20`}
              />
            </div>
            <input
              value={n.subject}
              onChange={(e) => {
                const nurture = [...c.nurture];
                nurture[i] = { ...n, subject: e.target.value };
                setC({ ...c, nurture });
              }}
              placeholder="Objet"
              className={inputCls}
            />
            <textarea
              rows={4}
              value={n.bodyHtml}
              onChange={(e) => {
                const nurture = [...c.nurture];
                nurture[i] = { ...n, bodyHtml: e.target.value };
                setC({ ...c, nurture });
              }}
              placeholder="Corps (HTML simple)"
              className={inputCls}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setC({ ...c, nurture: [...c.nurture, { delayDays: 2, subject: "", bodyHtml: "" }] })
          }
          className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"
        >
          <Plus className="h-3.5 w-3.5" /> Ajouter un email de relance
        </button>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {msg && (
          <span className={`text-sm font-semibold ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
