"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { updateFunnelContent } from "@/actions/funnel-content";
import type { FunnelContent } from "@/lib/funnel-content";

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
      <span className="mb-1 block text-xs font-semibold text-neutral-600">
        {label}
      </span>
      {textarea ? (
        <textarea
          rows={rows ?? 3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
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

export function FunnelContentForm({ initial }: { initial: FunnelContent }) {
  const router = useRouter();
  const [c, setC] = useState<FunnelContent>(initial);
  // Arrays edited as text (one item per line).
  const [questionText, setQuestionText] = useState(
    initial.question.options.map((o) => `${o.label} | ${o.response}`).join("\n"),
  );
  const [distractorsText, setDistractorsText] = useState(
    initial.exercise.distractors.join("\n"),
  );
  const [featuresText, setFeaturesText] = useState(
    initial.offer.features.join("\n"),
  );
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (patch: Partial<FunnelContent>) => setC((p) => ({ ...p, ...patch }));
  const setCapture = (patch: Partial<FunnelContent["capture"]>) =>
    set({ capture: { ...c.capture, ...patch } });
  const setIntro = (patch: Partial<FunnelContent["intro"]>) =>
    set({ intro: { ...c.intro, ...patch } });
  const setExercise = (patch: Partial<FunnelContent["exercise"]>) =>
    set({ exercise: { ...c.exercise, ...patch } });
  const setOffer = (patch: Partial<FunnelContent["offer"]>) =>
    set({ offer: { ...c.offer, ...patch } });

  const onSave = () => {
    setMsg(null);
    const options = questionText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, ...rest] = line.split("|");
        return { label: label.trim(), response: rest.join("|").trim() };
      })
      .filter((o) => o.label);
    const distractors = distractorsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const features = featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: FunnelContent = {
      ...c,
      question: { ...c.question, options },
      exercise: { ...c.exercise, distractors },
      offer: { ...c.offer, features },
    };

    startTransition(async () => {
      const res = await updateFunnelContent(payload);
      if (res?.error) setMsg({ ok: false, text: res.error });
      else {
        setMsg({ ok: true, text: "Enregistré ✓" });
        router.refresh();
      }
    });
  };

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-neutral-800">
          Contenu du Tunnel (V5) — /offre-a-vie
        </h2>
        <p className="text-sm text-neutral-500">
          Textes du tunnel « teste gratuitement ». Utilise{" "}
          <code className="rounded bg-neutral-100 px-1">{"{name}"}</code> pour
          insérer le prénom. (Le prix se règle dans l&apos;onglet « Offre &amp; prix ».)
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="1. Page de capture (prénom + email)">
          <Field label="Titre" value={c.capture.title} onChange={(v) => setCapture({ title: v })} />
          <Field label="Sous-titre" value={c.capture.subtitle} onChange={(v) => setCapture({ subtitle: v })} textarea />
          <Field label="Label prénom" value={c.capture.firstNameLabel} onChange={(v) => setCapture({ firstNameLabel: v })} />
          <Field label="Placeholder prénom" value={c.capture.firstNamePlaceholder} onChange={(v) => setCapture({ firstNamePlaceholder: v })} />
          <Field label="Label email" value={c.capture.emailLabel} onChange={(v) => setCapture({ emailLabel: v })} />
          <Field label="Placeholder email" value={c.capture.emailPlaceholder} onChange={(v) => setCapture({ emailPlaceholder: v })} />
          <Field label="Bouton" value={c.capture.cta} onChange={(v) => setCapture({ cta: v })} />
          <Field label="Réassurance (sous le bouton)" value={c.capture.reassurance} onChange={(v) => setCapture({ reassurance: v })} />
        </Section>

        <Section title="2. Accueil Koji">
          <Field label="Salutation" value={c.intro.greeting} onChange={(v) => setIntro({ greeting: v })} hint="Retour à la ligne autorisé. {name} = prénom." textarea />
          <Field label="Sous-titre" value={c.intro.subtitle} onChange={(v) => setIntro({ subtitle: v })} textarea />
          <Field label="Bouton" value={c.intro.cta} onChange={(v) => setIntro({ cta: v })} />
        </Section>

        <Section title="3. Question de personnalisation">
          <Field label="Question" value={c.question.title} onChange={(v) => set({ question: { ...c.question, title: v } })} />
          <Field
            label="Options (une par ligne : Réponse | Phrase de Koji)"
            value={questionText}
            onChange={setQuestionText}
            rows={5}
            textarea
            hint="Ex. : Comprendre le sens pendant la prière | Magnifique, chaque mot prendra vie !"
          />
        </Section>

        <Section title="4. Premier exercice">
          <Field label="Consigne" value={c.exercise.prompt} onChange={(v) => setExercise({ prompt: v })} />
          <Field label="Mot arabe" value={c.exercise.arabicWord} onChange={(v) => setExercise({ arabicWord: v })} />
          <Field label="Bonne réponse" value={c.exercise.correct} onChange={(v) => setExercise({ correct: v })} />
          <Field label="Mauvaises réponses (une par ligne)" value={distractorsText} onChange={setDistractorsText} textarea hint="2 conseillées." />
          <Field label="Texte de réussite" value={c.exercise.successText} onChange={(v) => setExercise({ successText: v })} hint="{name} = prénom." />
          <Field label="Texte « réessaie »" value={c.exercise.retryText} onChange={(v) => setExercise({ retryText: v })} />
          <Field label="Bouton" value={c.exercise.cta} onChange={(v) => setExercise({ cta: v })} />
        </Section>

        <Section title="5. Offre (paywall)">
          <Field label="Accroche (au-dessus du titre)" value={c.offer.kicker} onChange={(v) => setOffer({ kicker: v })} hint="{name} = prénom." />
          <Field label="Titre" value={c.offer.title} onChange={(v) => setOffer({ title: v })} textarea />
          <Field label="Sous-titre" value={c.offer.subtitle} onChange={(v) => setOffer({ subtitle: v })} textarea />
          <Field label="Mention sous le prix" value={c.offer.priceSuffix} onChange={(v) => setOffer({ priceSuffix: v })} hint="Ex. : une fois" />
          <Field label="Ce qui est inclus (une ligne = un point)" value={featuresText} onChange={setFeaturesText} rows={5} textarea />
          <Field label="Bouton d'achat" value={c.offer.cta} onChange={(v) => setOffer({ cta: v })} />
          <Field label="Garantie / sécurité" value={c.offer.guarantee} onChange={(v) => setOffer({ guarantee: v })} />
        </Section>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" size="sm" disabled={pending} onClick={onSave}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {msg && (
          <span className={`text-sm font-medium ${msg.ok ? "text-brilliant-green" : "text-rose-500"}`}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
