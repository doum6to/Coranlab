"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateFunnelContent } from "@/actions/funnel-content";
import type { FunnelContent, FunnelVersion } from "@/lib/funnel-content";

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20";

function Field({
  label,
  value,
  onChange,
  hint,
  textarea,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>
      {textarea ? (
        <textarea rows={rows ?? 3} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
      {hint && <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <h3 className="mb-3 text-sm font-bold text-neutral-800">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function FunnelContentForm({
  initialA,
  initialB,
  activeVersion,
}: {
  initialA: FunnelContent;
  initialB: FunnelContent;
  activeVersion: FunnelVersion;
}) {
  const router = useRouter();
  const [va, setVa] = useState<FunnelContent>(initialA);
  const [vb, setVb] = useState<FunnelContent>(initialB);
  const [editing, setEditing] = useState<FunnelVersion>(activeVersion);
  const [active, setActive] = useState<FunnelVersion>(activeVersion);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const c = editing === "a" ? va : vb;
  const patch = (updater: (c: FunnelContent) => FunnelContent) =>
    editing === "a" ? setVa(updater) : setVb(updater);

  const setCap = (k: keyof FunnelContent["capture"], v: string) =>
    patch((c) => ({ ...c, capture: { ...c.capture, [k]: v } }));
  const setIntro = (k: keyof FunnelContent["intro"], v: string) =>
    patch((c) => ({ ...c, intro: { ...c.intro, [k]: v } }));
  const setEx = (k: keyof FunnelContent["exercise"], v: string) =>
    patch((c) => ({ ...c, exercise: { ...c.exercise, [k]: v } }));
  const setOffer = (k: keyof FunnelContent["offer"], v: string) =>
    patch((c) => ({ ...c, offer: { ...c.offer, [k]: v } }));

  // Question options
  const setOpt = (i: number, k: "label" | "response", v: string) =>
    patch((c) => ({
      ...c,
      question: {
        ...c.question,
        options: c.question.options.map((o, idx) => (idx === i ? { ...o, [k]: v } : o)),
      },
    }));
  const addOpt = () =>
    patch((c) => ({ ...c, question: { ...c.question, options: [...c.question.options, { label: "", response: "" }] } }));
  const rmOpt = (i: number) =>
    patch((c) => ({ ...c, question: { ...c.question, options: c.question.options.filter((_, idx) => idx !== i) } }));

  // Exercise items
  const setItem = (i: number, patchItem: Partial<FunnelContent["exercise"]["items"][number]>) =>
    patch((c) => ({
      ...c,
      exercise: { ...c.exercise, items: c.exercise.items.map((it, idx) => (idx === i ? { ...it, ...patchItem } : it)) },
    }));
  const setDistractor = (i: number, j: number, v: string) =>
    patch((c) => ({
      ...c,
      exercise: {
        ...c.exercise,
        items: c.exercise.items.map((it, idx) =>
          idx === i ? { ...it, distractors: it.distractors.map((d, dj) => (dj === j ? v : d)) } : it,
        ),
      },
    }));
  const addItem = () =>
    patch((c) => ({
      ...c,
      exercise: {
        ...c.exercise,
        items: [...c.exercise.items, { enabled: true, arabicWord: "", correct: "", distractors: ["", ""] }],
      },
    }));
  const rmItem = (i: number) =>
    patch((c) => ({ ...c, exercise: { ...c.exercise, items: c.exercise.items.filter((_, idx) => idx !== i) } }));

  // Offer features
  const setFeat = (i: number, v: string) =>
    patch((c) => ({ ...c, offer: { ...c.offer, features: c.offer.features.map((f, idx) => (idx === i ? v : f)) } }));
  const addFeat = () => patch((c) => ({ ...c, offer: { ...c.offer, features: [...c.offer.features, ""] } }));
  const rmFeat = (i: number) =>
    patch((c) => ({ ...c, offer: { ...c.offer, features: c.offer.features.filter((_, idx) => idx !== i) } }));

  const onSave = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await updateFunnelContent({ a: va, b: vb, activeVersion: active });
      if (res?.error) setMsg({ ok: false, text: res.error });
      else {
        setMsg({ ok: true, text: "Enregistré ✓" });
        router.refresh();
      }
    });
  };

  const enabledCount = c.exercise.items.filter((i) => i.enabled).length;

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-neutral-800">Tunnel (V5) — /offre-a-vie</h2>
        <p className="text-sm text-neutral-500">
          Tunnel « teste gratuitement ». Utilise{" "}
          <code className="rounded bg-neutral-100 px-1">{"{name}"}</code> pour le prénom.
          Le prix de chaque version se règle dans « Offre &amp; prix ».
        </p>
      </div>

      {/* Active version + edited version */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#6967fb]/30 bg-[#6967fb]/5 p-3">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6967fb]">
            Version en ligne (A/B test)
          </span>
          <div className="flex gap-2">
            {(["a", "b"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setActive(v)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  active === v ? "bg-[#6967fb] text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                Version {v.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-neutral-400">
            <code>/offre-a-vie</code> affiche cette version.{" "}
            <code>/offre-a-vie-v4</code> affiche toujours la version B — pour
            comparer A et B en parallèle (envoie ta pub sur les 2 liens).
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Version en cours d&apos;édition
          </span>
          <div className="flex gap-2">
            {(["a", "b"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setEditing(v)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  editing === v ? "bg-neutral-900 text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                Modifier {v.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-neutral-400">
            Les deux versions sont enregistrées ensemble.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="1. Page de capture (prénom + email)">
          <Field label="Titre" value={c.capture.title} onChange={(v) => setCap("title", v)} />
          <Field label="Sous-titre" value={c.capture.subtitle} onChange={(v) => setCap("subtitle", v)} textarea />
          <Field label="Label prénom" value={c.capture.firstNameLabel} onChange={(v) => setCap("firstNameLabel", v)} />
          <Field label="Placeholder prénom" value={c.capture.firstNamePlaceholder} onChange={(v) => setCap("firstNamePlaceholder", v)} />
          <Field label="Label email" value={c.capture.emailLabel} onChange={(v) => setCap("emailLabel", v)} />
          <Field label="Placeholder email" value={c.capture.emailPlaceholder} onChange={(v) => setCap("emailPlaceholder", v)} />
          <Field label="Bouton" value={c.capture.cta} onChange={(v) => setCap("cta", v)} />
          <Field label="Réassurance" value={c.capture.reassurance} onChange={(v) => setCap("reassurance", v)} />
        </Section>

        <Section title="2. Accueil Koji">
          <Field label="Salutation" value={c.intro.greeting} onChange={(v) => setIntro("greeting", v)} hint="Retour à la ligne OK. {name} = prénom." textarea />
          <Field label="Sous-titre" value={c.intro.subtitle} onChange={(v) => setIntro("subtitle", v)} textarea />
          <Field label="Bouton" value={c.intro.cta} onChange={(v) => setIntro("cta", v)} />
        </Section>

        <Section title="3. Question de personnalisation">
          <Field label="Question" value={c.question.title} onChange={(v) => patch((cc) => ({ ...cc, question: { ...cc.question, title: v } }))} />
          {c.question.options.map((o, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 bg-white p-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-500">Option {i + 1}</span>
                <button type="button" onClick={() => rmOpt(i)} className="text-neutral-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input className={inputCls} value={o.label} onChange={(e) => setOpt(i, "label", e.target.value)} placeholder="Réponse" />
              <input className={`${inputCls} mt-1.5`} value={o.response} onChange={(e) => setOpt(i, "response", e.target.value)} placeholder="Phrase de Koji" />
            </div>
          ))}
          <button type="button" onClick={addOpt} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6967fb]">
            <Plus className="h-3.5 w-3.5" /> Ajouter une option
          </button>
        </Section>

        <Section title={`4. Exercices (${enabledCount} actif${enabledCount > 1 ? "s" : ""})`}>
          <p className="text-[11px] text-neutral-400">
            Décoche un exercice pour le masquer. Les exercices actifs forment le
            mini-parcours joué dans le tunnel.
          </p>
          <Field label="Consigne" value={c.exercise.prompt} onChange={(v) => setEx("prompt", v)} />
          {c.exercise.items.map((it, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 bg-white p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                  <input type="checkbox" checked={it.enabled} onChange={(e) => setItem(i, { enabled: e.target.checked })} className="h-4 w-4" />
                  Exercice {i + 1} {it.enabled ? "" : "(masqué)"}
                </label>
                <button type="button" onClick={() => rmItem(i)} className="text-neutral-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <input className={inputCls} dir="rtl" value={it.arabicWord} onChange={(e) => setItem(i, { arabicWord: e.target.value })} placeholder="م; Mot arabe" />
                <input className={inputCls} value={it.correct} onChange={(e) => setItem(i, { correct: e.target.value })} placeholder="Bonne réponse" />
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {it.distractors.map((d, j) => (
                  <input
                    key={j}
                    className={inputCls}
                    value={d}
                    onChange={(e) => setDistractor(i, j, e.target.value)}
                    placeholder={`Mauvaise réponse ${j + 1}`}
                  />
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={addItem} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6967fb]">
            <Plus className="h-3.5 w-3.5" /> Ajouter un exercice
          </button>
          <Field label="Texte de réussite (fin)" value={c.exercise.successText} onChange={(v) => setEx("successText", v)} hint="{name} = prénom." />
          <Field label="Texte « réessaie »" value={c.exercise.retryText} onChange={(v) => setEx("retryText", v)} />
          <Field label="Bouton" value={c.exercise.cta} onChange={(v) => setEx("cta", v)} />
        </Section>

        <Section title="5. Offre (paywall)">
          <Field label="Accroche" value={c.offer.kicker} onChange={(v) => setOffer("kicker", v)} hint="{name} = prénom." />
          <Field label="Titre" value={c.offer.title} onChange={(v) => setOffer("title", v)} textarea />
          <Field label="Sous-titre" value={c.offer.subtitle} onChange={(v) => setOffer("subtitle", v)} textarea />
          <Field label="Mention sous le prix" value={c.offer.priceSuffix} onChange={(v) => setOffer("priceSuffix", v)} />
          <div>
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Ce qui est inclus</span>
            {c.offer.features.map((f, i) => (
              <div key={i} className="mb-1.5 flex items-center gap-1.5">
                <input className={inputCls} value={f} onChange={(e) => setFeat(i, e.target.value)} />
                <button type="button" onClick={() => rmFeat(i)} className="text-neutral-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addFeat} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6967fb]">
              <Plus className="h-3.5 w-3.5" /> Ajouter un point
            </button>
          </div>
          <Field label="Bouton d'achat" value={c.offer.cta} onChange={(v) => setOffer("cta", v)} />
          <Field label="Garantie / sécurité" value={c.offer.guarantee} onChange={(v) => setOffer("guarantee", v)} />
        </Section>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" size="sm" disabled={pending} onClick={onSave}>
          {pending ? "Enregistrement…" : "Enregistrer les 2 versions"}
        </Button>
        {msg && (
          <span className={`text-sm font-medium ${msg.ok ? "text-brilliant-green" : "text-rose-500"}`}>{msg.text}</span>
        )}
      </div>
    </div>
  );
}
