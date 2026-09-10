"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateCommencerContent } from "@/actions/commencer-content";
import type { CommencerContent, CmStep, CmPlan, CmOption, CmTimeOption, CmReview, CmRow, CmTimelineItem } from "@/lib/commencer-shared";
import { compressImageFile } from "@/lib/images/compress-client";
import { createMediaUploadUrl } from "@/actions/landing-media";
import { createClient } from "@/lib/supabase/client";

type StepOf<T extends CmStep["type"]> = Extract<CmStep, { type: T }>;

const MAX = 50 * 1024 * 1024;
const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900";
const iconBtn = "rounded p-1 text-neutral-400 hover:bg-neutral-100 disabled:opacity-30";
const addBtn =
  "flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400";

const STEP_LABELS: Record<CmStep["type"], string> = {
  splash: "Splash (logo)",
  welcome: "Bienvenue",
  question: "Question",
  chart: "Graphique de progression",
  time: "Temps par jour",
  email: "Email (rappels)",
  social: "Preuve sociale (avis)",
  loader: "Chargement (création du plan)",
  plan: "Plan personnalisé",
  trial: "Essai gratuit (captures)",
  bell: "Rappel avant la fin de l'essai",
};

async function uploadImage(file: File): Promise<string> {
  let f = file;
  const raster = file.type.startsWith("image/") && file.type !== "image/gif" && file.type !== "image/svg+xml";
  if (raster) f = await compressImageFile(file, 2000, 0.85);
  if (f.size > MAX) throw new Error("Fichier trop lourd (max 50 Mo).");
  const ext = (f.name.split(".").pop() || "bin").toLowerCase();
  const signed = await createMediaUploadUrl(ext, "commencer");
  if ("error" in signed) throw new Error(signed.error);
  const { error } = await createClient()
    .storage.from(signed.bucket)
    .uploadToSignedUrl(signed.path, signed.token, f, { contentType: f.type || "application/octet-stream" });
  if (error) throw new Error(error.message);
  return signed.publicUrl;
}

/* ------------------------------------------------------------------ */
/* Generic field helpers                                               */
/* ------------------------------------------------------------------ */

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div>
        <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
function Text({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </label>
  );
}
function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </label>
  );
}
function Num({ label, value, onChange, step = 1, min = 0 }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>
      <input type="number" step={step} min={min} value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(Number(e.target.value) || 0)} className={inputCls} />
    </label>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-2">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-neutral-900" />
      <span className="text-xs font-semibold text-neutral-700">{label}</span>
    </label>
  );
}
function ImageField({ label, url, onChange }: { label: string; url: string; onChange: (u: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-neutral-200 object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-[10px] text-neutral-400">aucune</div>
        )}
        <div className="flex flex-col gap-1">
          <span className="cursor-pointer text-xs font-semibold text-[#6967fb] hover:underline">
            {busy ? "Upload…" : "Téléverser"}
            <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return; setErr(null); setBusy(true);
              try { onChange(await uploadImage(f)); } catch (er: any) { setErr(er?.message || "Échec."); } finally { setBusy(false); e.target.value = ""; }
            }} />
          </span>
          {url && <button type="button" onClick={() => onChange("")} className="text-left text-xs text-neutral-400 hover:text-red-600">Retirer</button>}
          {err && <span className="text-xs text-rose-500">{err}</span>}
        </div>
      </div>
    </label>
  );
}
function StringList({ label, items, onChange, textarea }: { label: string; items: string[]; onChange: (v: string[]) => void; textarea?: boolean }) {
  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-neutral-600">{label}</span>
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          {textarea ? (
            <textarea rows={2} value={it} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className={inputCls} />
          ) : (
            <input value={it} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className={inputCls} />
          )}
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-neutral-200 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className={addBtn}><Plus className="h-3.5 w-3.5" /> Ajouter</button>
    </div>
  );
}

/** Small reorder/delete toolbar shared by every list of sub-items. */
function RowControls({ index, length, onMove, onDelete }: { index: number; length: number; onMove: (from: number, to: number) => void; onDelete: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} className={iconBtn} aria-label="Monter"><ArrowUp className="h-4 w-4" /></button>
      <button type="button" disabled={index === length - 1} onClick={() => onMove(index, index + 1)} className={iconBtn} aria-label="Descendre"><ArrowDown className="h-4 w-4" /></button>
      <button type="button" onClick={onDelete} className={`${iconBtn} hover:text-red-600`} aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list]; const [m] = next.splice(from, 1); next.splice(to, 0, m); return next;
}

/** Generic editable list of objects with reorder/delete/add. */
function ObjList<T>({ label, items, onChange, blank, addLabel, render }: {
  label: string; items: T[]; onChange: (v: T[]) => void; blank: () => T; addLabel: string;
  render: (item: T, patch: (p: Partial<T>) => void) => React.ReactNode;
}) {
  const update = (i: number, p: Partial<T>) => onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-neutral-600">{label}</span>
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-white p-2">
          <div className="min-w-0 flex-1 space-y-2">{render(it, (p) => update(i, p))}</div>
          <RowControls index={i} length={items.length} onMove={(f, t) => onChange(moveItem(items, f, t))} onDelete={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, blank()])} className={addBtn}><Plus className="h-3.5 w-3.5" /> {addLabel}</button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step factories & editors                                            */
/* ------------------------------------------------------------------ */

function blankStep(type: CmStep["type"]): CmStep {
  switch (type) {
    case "splash": return { type, arabic: "قُرْآن", brand: "QURANLAB", tagline: "COMPRENDS LE CORAN" };
    case "welcome": return { type, headline: "Bienvenue sur Quranlab", tagline: "Comprends le Coran.\n**Enfin.**", cta: "Continuer", signinText: "Déjà un compte ?", signinCta: "Se connecter" };
    case "question": return { type, id: `q${Date.now().toString(36).slice(-4)}`, headline: "Nouvelle question", sub: "", multi: false, options: [{ id: "a", label: "Option A", icon: "" }, { id: "b", label: "Option B", icon: "" }], cta: "" };
    case "chart": return { type, headline: "Conçu pour te rapprocher du Coran", chartLabel: "Ta progression", brandLabel: "Quranlab", othersLabel: "Autres méthodes", xStart: "Mois 0", xEnd: "Mois 1", checkTitle: "Quranlab va t'aider à", checklist: [""], cta: "" };
    case "time": return { type, headline: "Combien de temps par jour ?", goalLabel: "Ton objectif", aloneLabel: "Seul(e)", xStart: "Maintenant", xEnd: "3 mois", placeholder: "Choisis une durée.", sentence: "À {min} min par jour, tu comprendras 85% du Coran **en {weeks} semaines**.", options: [{ minutes: 5, label: "5 min", weeks: 10 }, { minutes: 15, label: "15 min", weeks: 8 }], cta: "" };
    case "email": return { type, headline: "Atteins ton objectif avec des rappels", sub: "", placeholder: "ton@email.com", cta: "Recevoir mon plan", note: "Pas de spam", skip: "Passer" };
    case "social": return { type, headline: "Ils comprennent enfin leur prière", rating: "4,9", ratingSub: "Plus de 1 500 apprenants", sub: "", reviews: [{ initials: "AB", name: "Prénom", text: "" }], cta: "", lockSeconds: 2.5 };
    case "loader": return { type, headline: "Création de ton plan personnalisé", captions: ["Calibrage à ton niveau…"], durationMs: 7000 };
    case "plan": return { type, headline: "Ton plan personnalisé est prêt", journeyTitle: "Parcours Coran", levelPill: "Niveau {level} · {levelLabel}", yourPlanLabel: "TON PLAN", minutesLabel: "par jour", dateLabel: "ton objectif", rows: [{ icon: "🎯", label: "Objectif", text: "" }], cta: "Commencer mon plan" };
    case "trial": return { type, headline: "On veut que tu essaies Quranlab **gratuitement**", cta: "Essayer pour 0,00 €", screenshots: [] };
    case "bell": return { type, headline: "On t'enverra un rappel avant la fin de ton essai gratuit", cta: "Continuer GRATUITEMENT" };
  }
}

function stepSummary(step: CmStep): string {
  switch (step.type) {
    case "splash": return step.brand;
    case "question": return `[${step.id}] ${step.headline}`;
    default: return step.headline;
  }
}

function OptionalCta({ value, onChange }: { value: string | undefined; onChange: (v: string) => void }) {
  return <Text label="Bouton (optionnel, vide = « Continuer »)" value={value ?? ""} onChange={onChange} />;
}

function SplashEditor({ step, patch }: { step: StepOf<"splash">; patch: (p: Partial<StepOf<"splash">>) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Text label="Mot arabe (Jomhuria)" value={step.arabic} onChange={(arabic) => patch({ arabic })} />
      <Text label="Marque" value={step.brand} onChange={(brand) => patch({ brand })} />
      <Text label="Tagline" value={step.tagline} onChange={(tagline) => patch({ tagline })} />
    </div>
  );
}

function WelcomeEditor({ step, patch }: { step: StepOf<"welcome">; patch: (p: Partial<StepOf<"welcome">>) => void }) {
  return (
    <>
      <Text label="Titre" value={step.headline} onChange={(headline) => patch({ headline })} />
      <Area label="Accroche (retour à la ligne accepté)" value={step.tagline} onChange={(tagline) => patch({ tagline })} rows={2} />
      <div className="grid grid-cols-3 gap-3">
        <Text label="Bouton" value={step.cta} onChange={(cta) => patch({ cta })} />
        <Text label="Texte « déjà un compte »" value={step.signinText} onChange={(signinText) => patch({ signinText })} />
        <Text label="Lien connexion" value={step.signinCta} onChange={(signinCta) => patch({ signinCta })} />
      </div>
    </>
  );
}

function QuestionEditor({ step, patch }: { step: StepOf<"question">; patch: (p: Partial<StepOf<"question">>) => void }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <Text label="Identifiant (clé de la réponse)" value={step.id} onChange={(id) => patch({ id })} placeholder="why, level, source…" />
        <div className="col-span-2"><Text label="Question" value={step.headline} onChange={(headline) => patch({ headline })} /></div>
      </div>
      <Text label="Sous-texte (optionnel)" value={step.sub ?? ""} onChange={(sub) => patch({ sub })} />
      <Toggle label="Choix multiples (plusieurs réponses possibles)" value={step.multi} onChange={(multi) => patch({ multi })} />
      <ObjList<CmOption>
        label="Options (identifiant · libellé · icône emoji)"
        items={step.options}
        onChange={(options) => patch({ options })}
        blank={() => ({ id: "", label: "", icon: "" })}
        addLabel="Ajouter une option"
        render={(o, p) => (
          <div className="grid grid-cols-[1fr_2fr_64px] gap-2">
            <input value={o.id} placeholder="id" onChange={(e) => p({ id: e.target.value })} className={inputCls} />
            <input value={o.label} placeholder="Libellé" onChange={(e) => p({ label: e.target.value })} className={inputCls} />
            <input value={o.icon ?? ""} placeholder="🕌" onChange={(e) => p({ icon: e.target.value })} className={`${inputCls} text-center`} />
          </div>
        )}
      />
      <OptionalCta value={step.cta} onChange={(cta) => patch({ cta })} />
    </>
  );
}

function ChartEditor({ step, patch }: { step: StepOf<"chart">; patch: (p: Partial<StepOf<"chart">>) => void }) {
  return (
    <>
      <Text label="Titre" value={step.headline} onChange={(headline) => patch({ headline })} />
      <div className="grid grid-cols-3 gap-3">
        <Text label="Label du graphique" value={step.chartLabel} onChange={(chartLabel) => patch({ chartLabel })} />
        <Text label="Courbe marque" value={step.brandLabel} onChange={(brandLabel) => patch({ brandLabel })} />
        <Text label="Courbe « autres »" value={step.othersLabel} onChange={(othersLabel) => patch({ othersLabel })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Text label="Axe X début" value={step.xStart} onChange={(xStart) => patch({ xStart })} />
        <Text label="Axe X fin" value={step.xEnd} onChange={(xEnd) => patch({ xEnd })} />
      </div>
      <Text label="Titre de la checklist" value={step.checkTitle} onChange={(checkTitle) => patch({ checkTitle })} />
      <StringList label="Checklist" items={step.checklist} onChange={(checklist) => patch({ checklist })} />
      <OptionalCta value={step.cta} onChange={(cta) => patch({ cta })} />
    </>
  );
}

function TimeEditor({ step, patch }: { step: StepOf<"time">; patch: (p: Partial<StepOf<"time">>) => void }) {
  return (
    <>
      <Text label="Titre" value={step.headline} onChange={(headline) => patch({ headline })} />
      <div className="grid grid-cols-2 gap-3">
        <Text label="Label objectif (courbe)" value={step.goalLabel} onChange={(goalLabel) => patch({ goalLabel })} />
        <Text label="Label « seul(e) » (courbe)" value={step.aloneLabel} onChange={(aloneLabel) => patch({ aloneLabel })} />
        <Text label="Axe X début" value={step.xStart} onChange={(xStart) => patch({ xStart })} />
        <Text label="Axe X fin" value={step.xEnd} onChange={(xEnd) => patch({ xEnd })} />
      </div>
      <Area label="Texte avant sélection (placeholder)" value={step.placeholder} onChange={(placeholder) => patch({ placeholder })} rows={2} />
      <Area label="Phrase après sélection — utilise {min} et {weeks}" value={step.sentence} onChange={(sentence) => patch({ sentence })} rows={2} />
      <ObjList<CmTimeOption>
        label="Durées (minutes · libellé · semaines pour atteindre l'objectif)"
        items={step.options}
        onChange={(options) => patch({ options })}
        blank={() => ({ minutes: 10, label: "10 min", weeks: 8 })}
        addLabel="Ajouter une durée"
        render={(o, p) => (
          <div className="grid grid-cols-3 gap-2">
            <input type="number" min={1} value={o.minutes} placeholder="min" onChange={(e) => p({ minutes: Number(e.target.value) || 0 })} className={inputCls} />
            <input value={o.label} placeholder="Libellé" onChange={(e) => p({ label: e.target.value })} className={inputCls} />
            <input type="number" min={1} value={o.weeks} placeholder="semaines" onChange={(e) => p({ weeks: Number(e.target.value) || 0 })} className={inputCls} />
          </div>
        )}
      />
      <OptionalCta value={step.cta} onChange={(cta) => patch({ cta })} />
    </>
  );
}

function EmailEditor({ step, patch }: { step: StepOf<"email">; patch: (p: Partial<StepOf<"email">>) => void }) {
  return (
    <>
      <Text label="Titre" value={step.headline} onChange={(headline) => patch({ headline })} />
      <Area label="Sous-texte" value={step.sub} onChange={(sub) => patch({ sub })} rows={2} />
      <div className="grid grid-cols-2 gap-3">
        <Text label="Placeholder du champ" value={step.placeholder} onChange={(placeholder) => patch({ placeholder })} />
        <Text label="Bouton" value={step.cta} onChange={(cta) => patch({ cta })} />
        <Text label="Note sous le bouton" value={step.note} onChange={(note) => patch({ note })} />
        <Text label="Lien « passer » (vide = pas de lien)" value={step.skip ?? ""} onChange={(skip) => patch({ skip })} />
      </div>
    </>
  );
}

function SocialEditor({ step, patch }: { step: StepOf<"social">; patch: (p: Partial<StepOf<"social">>) => void }) {
  return (
    <>
      <Text label="Titre" value={step.headline} onChange={(headline) => patch({ headline })} />
      <div className="grid grid-cols-3 gap-3">
        <Text label="Note (ex. 4,9)" value={step.rating} onChange={(rating) => patch({ rating })} />
        <Text label="Sous la note" value={step.ratingSub} onChange={(ratingSub) => patch({ ratingSub })} />
        <Num label="Verrou du bouton (secondes)" value={step.lockSeconds} step={0.5} onChange={(lockSeconds) => patch({ lockSeconds })} />
      </div>
      <Text label="Sous-texte" value={step.sub} onChange={(sub) => patch({ sub })} />
      <ObjList<CmReview>
        label="Avis (initiales · prénom · texte)"
        items={step.reviews}
        onChange={(reviews) => patch({ reviews })}
        blank={() => ({ initials: "", name: "", text: "" })}
        addLabel="Ajouter un avis"
        render={(r, p) => (
          <>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <input value={r.initials} placeholder="AB" onChange={(e) => p({ initials: e.target.value })} className={inputCls} />
              <input value={r.name} placeholder="Prénom" onChange={(e) => p({ name: e.target.value })} className={inputCls} />
            </div>
            <textarea rows={2} value={r.text} placeholder="Texte de l'avis" onChange={(e) => p({ text: e.target.value })} className={inputCls} />
          </>
        )}
      />
      <OptionalCta value={step.cta} onChange={(cta) => patch({ cta })} />
    </>
  );
}

function LoaderEditor({ step, patch }: { step: StepOf<"loader">; patch: (p: Partial<StepOf<"loader">>) => void }) {
  return (
    <>
      <div className="grid grid-cols-[1fr_160px] gap-3">
        <Text label="Titre" value={step.headline} onChange={(headline) => patch({ headline })} />
        <Num label="Durée totale (ms)" value={step.durationMs} step={500} onChange={(durationMs) => patch({ durationMs })} />
      </div>
      <StringList label="Légendes qui défilent pendant le chargement" items={step.captions} onChange={(captions) => patch({ captions })} />
    </>
  );
}

function PlanEditor({ step, patch }: { step: StepOf<"plan">; patch: (p: Partial<StepOf<"plan">>) => void }) {
  return (
    <>
      <Text label="Titre" value={step.headline} onChange={(headline) => patch({ headline })} />
      <div className="grid grid-cols-2 gap-3">
        <Text label="Titre du parcours" value={step.journeyTitle} onChange={(journeyTitle) => patch({ journeyTitle })} />
        <Text label="Pastille niveau — {level} {levelLabel}" value={step.levelPill} onChange={(levelPill) => patch({ levelPill })} />
        <Text label="Label « ton plan »" value={step.yourPlanLabel} onChange={(yourPlanLabel) => patch({ yourPlanLabel })} />
        <Text label="Label minutes" value={step.minutesLabel} onChange={(minutesLabel) => patch({ minutesLabel })} />
        <Text label="Label date objectif" value={step.dateLabel} onChange={(dateLabel) => patch({ dateLabel })} />
        <Text label="Bouton" value={step.cta} onChange={(cta) => patch({ cta })} />
      </div>
      <ObjList<CmRow>
        label="Lignes du plan (icône · label · texte — {min} accepté)"
        items={step.rows}
        onChange={(rows) => patch({ rows })}
        blank={() => ({ icon: "", label: "", text: "" })}
        addLabel="Ajouter une ligne"
        render={(r, p) => (
          <div className="grid grid-cols-[64px_1fr_2fr] gap-2">
            <input value={r.icon ?? ""} placeholder="🎯" onChange={(e) => p({ icon: e.target.value })} className={`${inputCls} text-center`} />
            <input value={r.label} placeholder="Label" onChange={(e) => p({ label: e.target.value })} className={inputCls} />
            <input value={r.text} placeholder="Texte" onChange={(e) => p({ text: e.target.value })} className={inputCls} />
          </div>
        )}
      />
    </>
  );
}

function TrialEditor({ step, patch }: { step: StepOf<"trial">; patch: (p: Partial<StepOf<"trial">>) => void }) {
  const shots = step.screenshots;
  return (
    <>
      <Text label="Titre" value={step.headline} onChange={(headline) => patch({ headline })} />
      <Text label="Bouton" value={step.cta} onChange={(cta) => patch({ cta })} />
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-neutral-600">Captures d&apos;écran de l&apos;app (carrousel)</span>
        {shots.map((url, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-white p-2">
            <div className="flex-1"><ImageField label={`Capture ${i + 1}`} url={url} onChange={(u) => patch({ screenshots: shots.map((x, j) => (j === i ? u : x)) })} /></div>
            <RowControls index={i} length={shots.length} onMove={(f, t) => patch({ screenshots: moveItem(shots, f, t) })} onDelete={() => patch({ screenshots: shots.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <button type="button" onClick={() => patch({ screenshots: [...shots, ""] })} className={addBtn}><Plus className="h-3.5 w-3.5" /> Ajouter une capture</button>
      </div>
    </>
  );
}

function BellEditor({ step, patch }: { step: StepOf<"bell">; patch: (p: Partial<StepOf<"bell">>) => void }) {
  return (
    <div className="grid grid-cols-[2fr_1fr] gap-3">
      <Text label="Titre" value={step.headline} onChange={(headline) => patch({ headline })} />
      <Text label="Bouton" value={step.cta} onChange={(cta) => patch({ cta })} />
    </div>
  );
}

function StepFields({ step, onChange }: { step: CmStep; onChange: (s: CmStep) => void }) {
  // Each branch narrows `step`; the patch spreads onto the narrowed step so the
  // discriminant is preserved.
  switch (step.type) {
    case "splash": return <SplashEditor step={step} patch={(p) => onChange({ ...step, ...p })} />;
    case "welcome": return <WelcomeEditor step={step} patch={(p) => onChange({ ...step, ...p })} />;
    case "question": return <QuestionEditor step={step} patch={(p) => onChange({ ...step, ...p })} />;
    case "chart": return <ChartEditor step={step} patch={(p) => onChange({ ...step, ...p })} />;
    case "time": return <TimeEditor step={step} patch={(p) => onChange({ ...step, ...p })} />;
    case "email": return <EmailEditor step={step} patch={(p) => onChange({ ...step, ...p })} />;
    case "social": return <SocialEditor step={step} patch={(p) => onChange({ ...step, ...p })} />;
    case "loader": return <LoaderEditor step={step} patch={(p) => onChange({ ...step, ...p })} />;
    case "plan": return <PlanEditor step={step} patch={(p) => onChange({ ...step, ...p })} />;
    case "trial": return <TrialEditor step={step} patch={(p) => onChange({ ...step, ...p })} />;
    case "bell": return <BellEditor step={step} patch={(p) => onChange({ ...step, ...p })} />;
  }
}

function StepCard({ step, index, length, onChange, onMove, onDelete }: {
  step: CmStep; index: number; length: number; onChange: (s: CmStep) => void; onMove: (from: number, to: number) => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center gap-2 p-2">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          {open ? <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />}
          <span className="w-6 shrink-0 text-center text-xs font-bold text-neutral-400">{index + 1}</span>
          <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600">{STEP_LABELS[step.type]}</span>
          <span className="truncate text-xs text-neutral-700">{stepSummary(step)}</span>
        </button>
        <RowControls index={index} length={length} onMove={onMove} onDelete={onDelete} />
      </div>
      {open && <div className="space-y-3 border-t border-neutral-100 p-3"><StepFields step={step} onChange={onChange} /></div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Paywall plan                                                        */
/* ------------------------------------------------------------------ */

function PlanFields({ title, plan, onChange }: { title: string; plan: CmPlan; onChange: (p: CmPlan) => void }) {
  const p = (patch: Partial<CmPlan>) => onChange({ ...plan, ...patch });
  return (
    <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
      <span className="text-xs font-bold text-neutral-700">{title}</span>
      <div className="grid grid-cols-3 gap-3">
        <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Montant (€)</span>
          <input type="number" step="0.01" min="0" value={(plan.amountCents / 100).toString()} onChange={(e) => p({ amountCents: Math.round((Number(e.target.value) || 0) * 100) })} className={inputCls} /></label>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Intervalle</span>
          <select value={plan.interval} onChange={(e) => p({ interval: e.target.value === "week" ? "week" : "year" })} className={inputCls}>
            <option value="week">Semaine</option><option value="year">Année</option></select></label>
        <Text label="Titre" value={plan.title} onChange={(title) => p({ title })} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Text label="Prix affiché" value={plan.priceLabel} onChange={(priceLabel) => p({ priceLabel })} placeholder="47 €" />
        <Text label="Suffixe (/ an)" value={plan.per} onChange={(per) => p({ per })} />
        <Text label="Sous-texte" value={plan.sub} onChange={(sub) => p({ sub })} placeholder="≈ 3,92 € / mois" />
      </div>
      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
        <Text label="Badge (vide = aucun)" value={plan.tag} onChange={(tag) => p({ tag })} placeholder="−82 % • 7 JOURS GRATUITS" />
        <Toggle label="Populaire (sélectionné par défaut)" value={plan.popular} onChange={(popular) => p({ popular })} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main form                                                           */
/* ------------------------------------------------------------------ */

export function CommencerForm({ initial }: { initial: CommencerContent }) {
  const [c, setC] = useState<CommencerContent>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [newType, setNewType] = useState<CmStep["type"]>("question");
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = (patch: Partial<CommencerContent>) => setC((p) => ({ ...p, ...patch }));
  const setPw = (patch: Partial<CommencerContent["paywall"]>) => setC((p) => ({ ...p, paywall: { ...p.paywall, ...patch } }));
  const setMerci = (patch: Partial<CommencerContent["merci"]>) => setC((p) => ({ ...p, merci: { ...p.merci, ...patch } }));

  const save = () =>
    start(async () => {
      setMsg(null);
      const res = await updateCommencerContent(c);
      if (res && "error" in res && res.error) setMsg({ ok: false, text: res.error });
      else { setMsg({ ok: true, text: "Enregistré ✓" }); router.refresh(); }
    });

  const pw = c.paywall;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <a href="/commencer" target="_blank" className="text-xs font-semibold text-[#6967fb] hover:underline">Voir la page ↗</a>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <p><strong>Astuce :</strong> dans les titres et textes, <code className="rounded bg-white px-1">**mot**</code> s&apos;affiche en surlignage rose.</p>
        <p className="mt-1">Variables disponibles : <code className="rounded bg-white px-1">{"{min}"}</code> (minutes/jour choisies), <code className="rounded bg-white px-1">{"{weeks}"}</code> (semaines calculées), <code className="rounded bg-white px-1">{"{level}"}</code> et <code className="rounded bg-white px-1">{"{levelLabel}"}</code> (niveau choisi), <code className="rounded bg-white px-1">{"{date}"}</code> (date de fin d&apos;essai / objectif).</p>
      </div>

      <Section title="Apparence">
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Couleur d&apos;accent</span>
            <input type="color" value={c.accentColor} onChange={(e) => set({ accentColor: e.target.value })} className="h-10 w-full rounded-lg border border-neutral-300" /></label>
          <Text label="Hex" value={c.accentColor} onChange={(accentColor) => set({ accentColor })} placeholder="#F3B6C4" />
        </div>
      </Section>

      <Section title={`Étapes de l'onboarding (${c.steps.length})`} hint="Cliquer sur une étape pour l'ouvrir. L'ordre ici est l'ordre d'affichage.">
        <div className="space-y-2">
          {c.steps.map((st, i) => (
            <StepCard
              key={i}
              step={st}
              index={i}
              length={c.steps.length}
              onChange={(s) => set({ steps: c.steps.map((x, j) => (j === i ? s : x)) })}
              onMove={(f, t) => set({ steps: moveItem(c.steps, f, t) })}
              onDelete={() => { if (window.confirm("Supprimer cette étape ?")) set({ steps: c.steps.filter((_, j) => j !== i) }); }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select value={newType} onChange={(e) => setNewType(e.target.value as CmStep["type"])} className={`${inputCls} max-w-xs`}>
            {(Object.keys(STEP_LABELS) as CmStep["type"][]).map((t) => <option key={t} value={t}>{STEP_LABELS[t]}</option>)}
          </select>
          <button type="button" onClick={() => set({ steps: [...c.steps, blankStep(newType)] })} className={`${addBtn} shrink-0`}><Plus className="h-3.5 w-3.5" /> Ajouter une étape</button>
        </div>
      </Section>

      <Section title="Paywall (essai gratuit)">
        <Text label="Titre" value={pw.title} onChange={(title) => setPw({ title })} />
        <Text label="Sous-titre" value={pw.subtitle} onChange={(subtitle) => setPw({ subtitle })} />
        <ObjList<CmTimelineItem>
          label="Timeline (icône · titre · texte — {date} accepté)"
          items={pw.timeline}
          onChange={(timeline) => setPw({ timeline })}
          blank={() => ({ icon: "", title: "", text: "" })}
          addLabel="Ajouter une étape de timeline"
          render={(t, p) => (
            <>
              <div className="grid grid-cols-[64px_1fr] gap-2">
                <input value={t.icon ?? ""} placeholder="🔓" onChange={(e) => p({ icon: e.target.value })} className={`${inputCls} text-center`} />
                <input value={t.title} placeholder="Titre" onChange={(e) => p({ title: e.target.value })} className={inputCls} />
              </div>
              <textarea rows={2} value={t.text} placeholder="Texte" onChange={(e) => p({ text: e.target.value })} className={inputCls} />
            </>
          )}
        />
        <PlanFields title="Plan annuel" plan={pw.annual} onChange={(annual) => setPw({ annual })} />
        <PlanFields title="Plan hebdomadaire" plan={pw.weekly} onChange={(weekly) => setPw({ weekly })} />
        <div className="grid grid-cols-2 gap-3">
          <Text label="Réassurance (au-dessus du bouton)" value={pw.reassurance} onChange={(reassurance) => setPw({ reassurance })} />
          <Text label="Bouton" value={pw.cta} onChange={(cta) => setPw({ cta })} />
        </div>
        <Area label="Mentions — plan annuel" value={pw.finePrintAnnual} onChange={(finePrintAnnual) => setPw({ finePrintAnnual })} rows={2} />
        <Area label="Mentions — plan hebdomadaire" value={pw.finePrintWeekly} onChange={(finePrintWeekly) => setPw({ finePrintWeekly })} rows={2} />
      </Section>

      <Section title="Page merci (après paiement)">
        <Text label="Titre" value={c.merci.title} onChange={(title) => setMerci({ title })} />
        <Area label="Texte" value={c.merci.text} onChange={(text) => setMerci({ text })} rows={2} />
        <Text label="Bouton" value={c.merci.cta} onChange={(cta) => setMerci({ cta })} />
      </Section>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-neutral-200 bg-white/95 py-3 backdrop-blur">
        <Button onClick={save} disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button>
        {msg && <span className={`text-sm font-semibold ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
