"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updatePriereVslContent } from "@/actions/priere-vsl-content";
import type { PriereVslContent } from "@/lib/priere-vsl-shared";
import { compressImageFile } from "@/lib/images/compress-client";
import { createMediaUploadUrl } from "@/actions/landing-media";
import { createClient } from "@/lib/supabase/client";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900";

async function uploadImage(file: File): Promise<string> {
  let f = file;
  const isRaster =
    file.type.startsWith("image/") && file.type !== "image/gif" && file.type !== "image/svg+xml";
  if (isRaster) f = await compressImageFile(file, 2000, 0.85);
  if (f.size > MAX_UPLOAD_BYTES) throw new Error("Fichier trop lourd (max 50 Mo).");
  const ext = (f.name.split(".").pop() || "bin").toLowerCase();
  const signed = await createMediaUploadUrl(ext, "priere");
  if ("error" in signed) throw new Error(signed.error);
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(signed.bucket)
    .uploadToSignedUrl(signed.path, signed.token, f, {
      contentType: f.type || "application/octet-stream",
    });
  if (error) throw new Error(error.message);
  return signed.publicUrl;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>
      {children}
    </label>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </Field>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <Field label={label}>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </Field>
  );
}

function ImageField({
  label,
  url,
  onChange,
}: {
  label: string;
  url: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-neutral-200 object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-[10px] text-neutral-400">
            aucune
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="cursor-pointer text-xs font-semibold text-[#6967fb] hover:underline">
            {busy ? "Upload…" : "Téléverser une image"}
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
                  setErr(er?.message || "Échec.");
                } finally {
                  setBusy(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
          {url && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-left text-xs text-neutral-400 hover:text-red-600"
            >
              Retirer
            </button>
          )}
          {err && <span className="text-xs text-rose-500">{err}</span>}
        </div>
      </div>
    </Field>
  );
}

/** Editable list of plain strings (badges, bullets, avatars, paragraphs…). */
function StringList({
  label,
  items,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-neutral-600">{label}</span>
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          {textarea ? (
            <textarea
              rows={2}
              value={it}
              placeholder={placeholder}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              className={inputCls}
            />
          ) : (
            <input
              value={it}
              placeholder={placeholder}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
              className={inputCls}
            />
          )}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-neutral-200 hover:text-red-600"
            aria-label="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"
      >
        <Plus className="h-3.5 w-3.5" /> Ajouter
      </button>
    </div>
  );
}

/** Admin editor for the fully-editable /comprendre-sa-priere VSL page. */
export function PriereVslForm({ initial }: { initial: PriereVslContent }) {
  const [c, setC] = useState<PriereVslContent>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const set = (patch: Partial<PriereVslContent>) => setC((prev) => ({ ...prev, ...patch }));

  const save = () =>
    start(async () => {
      setMsg(null);
      const res = await updatePriereVslContent(c);
      if (res && "error" in res && res.error) setMsg({ ok: false, text: res.error });
      else {
        setMsg({ ok: true, text: "Enregistré ✓" });
        router.refresh();
      }
    });

  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= c.steps.length) return;
    const steps = [...c.steps];
    const [m] = steps.splice(from, 1);
    steps.splice(to, 0, m);
    set({ steps });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <a href="/comprendre-sa-priere" target="_blank" className="text-xs font-semibold text-[#6967fb] hover:underline">
          Voir la page ↗
        </a>
      </div>

      {/* THEME */}
      <Section title="Apparence">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Couleur de fond">
            <input type="color" value={c.bgColor} onChange={(e) => set({ bgColor: e.target.value })} className="h-10 w-full rounded-lg border border-neutral-300" />
          </Field>
          <Field label="Couleur d'accent (orange)">
            <input type="color" value={c.accentColor} onChange={(e) => set({ accentColor: e.target.value })} className="h-10 w-full rounded-lg border border-neutral-300" />
          </Field>
        </div>
      </Section>

      {/* NAV */}
      <Section title="Barre de navigation">
        <Text label="Nom / marque" value={c.brand} onChange={(v) => set({ brand: v })} />
        <Text label="Bouton (nav)" value={c.navCta} onChange={(v) => set({ navCta: v })} />
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-neutral-600">Liens (libellé · ancre)</span>
          {c.navLinks.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={l.label} placeholder="Libellé" onChange={(e) => set({ navLinks: c.navLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} className={inputCls} />
              <input value={l.anchor} placeholder="ancre (declic, etapes…)" onChange={(e) => set({ navLinks: c.navLinks.map((x, j) => (j === i ? { ...x, anchor: e.target.value } : x)) })} className={inputCls} />
              <button type="button" onClick={() => set({ navLinks: c.navLinks.filter((_, j) => j !== i) })} className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-neutral-200 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => set({ navLinks: [...c.navLinks, { label: "", anchor: "" }] })} className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"><Plus className="h-3.5 w-3.5" /> Ajouter un lien</button>
        </div>
      </Section>

      {/* HERO */}
      <Section title="Hero (haut de page)">
        <Text label="Accroche orange (eyebrow)" value={c.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Area label="Titre principal" value={c.title} onChange={(v) => set({ title: v })} rows={2} />
        <Area label="Sous-titre" value={c.subtitle} onChange={(v) => set({ subtitle: v })} />
        <StringList label="Badges verts" items={c.badges} onChange={(badges) => set({ badges })} placeholder="Ex. 5 min par jour" />
        <ImageField label="Image du hero" url={c.heroImage} onChange={(heroImage) => set({ heroImage })} />
        <StringList label="Points clés (bullets)" items={c.bullets} onChange={(bullets) => set({ bullets })} />
        <Text label="Bouton CTA (hero)" value={c.heroCta} onChange={(v) => set({ heroCta: v })} />
        <Text label="Preuve sociale" value={c.socialProof} onChange={(v) => set({ socialProof: v })} />
        <StringList label="Avatars (emojis)" items={c.avatars} onChange={(avatars) => set({ avatars })} placeholder="🧕" />
      </Section>

      {/* PRICE */}
      <Section title="Prix (value stack + checkout)">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Devise">
            <select value={c.price.currency} onChange={(e) => set({ price: { ...c.price, currency: e.target.value as any } })} className={inputCls}>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </Field>
          <Field label="Prix du jour">
            <input type="number" step="0.01" min="0" value={(c.price.amountCents / 100).toString()} onChange={(e) => set({ price: { ...c.price, amountCents: Math.round((Number(e.target.value) || 0) * 100) } })} className={inputCls} />
          </Field>
          <Field label="Prix barré (valeur)">
            <input type="number" step="0.01" min="0" value={(c.price.compareAtCents / 100).toString()} onChange={(e) => set({ price: { ...c.price, compareAtCents: Math.round((Number(e.target.value) || 0) * 100) } })} className={inputCls} />
          </Field>
        </div>
      </Section>

      {/* DÉCLIC */}
      <Section title="Section « Le déclic » (pourquoi si peu cher)">
        <Text label="Titre (utilise {price} pour insérer le prix)" value={c.declicHeading} onChange={(v) => set({ declicHeading: v })} />
        <StringList label="Paragraphes" items={c.declicParagraphs} onChange={(declicParagraphs) => set({ declicParagraphs })} textarea />
        <div className="grid grid-cols-2 gap-3">
          <Text label="Nom (signature)" value={c.declicAuthorName} onChange={(v) => set({ declicAuthorName: v })} />
          <Text label="Rôle (signature)" value={c.declicAuthorRole} onChange={(v) => set({ declicAuthorRole: v })} />
        </div>
        <ImageField label="Image de la section" url={c.declicImage} onChange={(declicImage) => set({ declicImage })} />
      </Section>

      {/* STEPS */}
      <Section title="Comment ça marche (étapes)">
        <Text label="Titre de section" value={c.stepsHeading} onChange={(v) => set({ stepsHeading: v })} />
        {c.steps.map((step, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Étape {i + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveStep(i, i - 1)} className="rounded p-1 text-neutral-400 hover:bg-neutral-100"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => moveStep(i, i + 1)} className="rounded p-1 text-neutral-400 hover:bg-neutral-100"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => set({ steps: c.steps.filter((_, j) => j !== i) })} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <input value={step.badge} placeholder="Badge (ex. Étape 1)" onChange={(e) => set({ steps: c.steps.map((x, j) => (j === i ? { ...x, badge: e.target.value } : x)) })} className={inputCls} />
            <input value={step.title} placeholder="Titre" onChange={(e) => set({ steps: c.steps.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} className={inputCls} />
            <textarea rows={2} value={step.desc} placeholder="Description" onChange={(e) => set({ steps: c.steps.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)) })} className={inputCls} />
            <ImageField label="Image de l'étape" url={step.image} onChange={(url) => set({ steps: c.steps.map((x, j) => (j === i ? { ...x, image: url } : x)) })} />
          </div>
        ))}
        <button type="button" onClick={() => set({ steps: [...c.steps, { badge: `Étape ${c.steps.length + 1}`, title: "", desc: "", image: "" }] })} className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"><Plus className="h-3.5 w-3.5" /> Ajouter une étape</button>
        <Text label="Bouton CTA (étapes)" value={c.stepsCta} onChange={(v) => set({ stepsCta: v })} />
      </Section>

      {/* VALUE STACK */}
      <Section title="Ce que tu reçois (value stack)">
        <Text label="Titre" value={c.stackHeading} onChange={(v) => set({ stackHeading: v })} />
        <Text label="Sous-titre" value={c.stackSubheading} onChange={(v) => set({ stackSubheading: v })} />
        {c.stackItems.map((it, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Élément {i + 1}</span>
              <button type="button" onClick={() => set({ stackItems: c.stackItems.filter((_, j) => j !== i) })} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            <input value={it.title} placeholder="Titre" onChange={(e) => set({ stackItems: c.stackItems.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} className={inputCls} />
            <input value={it.desc} placeholder="Description" onChange={(e) => set({ stackItems: c.stackItems.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)) })} className={inputCls} />
            <input value={it.value} placeholder="Valeur (ex. 29 €)" onChange={(e) => set({ stackItems: c.stackItems.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} className={inputCls} />
          </div>
        ))}
        <button type="button" onClick={() => set({ stackItems: [...c.stackItems, { title: "", desc: "", value: "" }] })} className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"><Plus className="h-3.5 w-3.5" /> Ajouter un élément</button>
        <div className="grid grid-cols-2 gap-3">
          <Text label="Libellé « valeur totale »" value={c.stackTotalLabel} onChange={(v) => set({ stackTotalLabel: v })} />
          <Text label="Libellé « prix du jour »" value={c.stackTodayLabel} onChange={(v) => set({ stackTodayLabel: v })} />
        </div>
        <Text label="Bouton CTA (stack)" value={c.stackCta} onChange={(v) => set({ stackCta: v })} />
        <Text label="Ligne de garantie" value={c.guarantee} onChange={(v) => set({ guarantee: v })} />
      </Section>

      {/* REVIEWS */}
      <Section title="Avis">
        <Text label="Titre de section" value={c.reviewsHeading} onChange={(v) => set({ reviewsHeading: v })} />
        {c.reviews.map((r, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Avis {i + 1}</span>
              <button type="button" onClick={() => set({ reviews: c.reviews.filter((_, j) => j !== i) })} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            <input value={r.name} placeholder="Prénom" onChange={(e) => set({ reviews: c.reviews.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} className={inputCls} />
            <textarea rows={2} value={r.text} placeholder="Avis" onChange={(e) => set({ reviews: c.reviews.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} className={inputCls} />
          </div>
        ))}
        <button type="button" onClick={() => set({ reviews: [...c.reviews, { name: "", text: "" }] })} className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"><Plus className="h-3.5 w-3.5" /> Ajouter un avis</button>
      </Section>

      {/* FAQ */}
      <Section title="FAQ">
        <Text label="Titre de section" value={c.faqHeading} onChange={(v) => set({ faqHeading: v })} />
        {c.faq.map((f, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Question {i + 1}</span>
              <button type="button" onClick={() => set({ faq: c.faq.filter((_, j) => j !== i) })} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            <input value={f.q} placeholder="Question" onChange={(e) => set({ faq: c.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) })} className={inputCls} />
            <textarea rows={2} value={f.a} placeholder="Réponse" onChange={(e) => set({ faq: c.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) })} className={inputCls} />
          </div>
        ))}
        <button type="button" onClick={() => set({ faq: [...c.faq, { q: "", a: "" }] })} className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"><Plus className="h-3.5 w-3.5" /> Ajouter une question</button>
      </Section>

      {/* CHECKOUT + FINAL */}
      <Section title="Checkout & CTA final">
        <Text label="Badge du checkout" value={c.checkoutBadge} onChange={(v) => set({ checkoutBadge: v })} />
        <Text label="Titre CTA final" value={c.finalHeading} onChange={(v) => set({ finalHeading: v })} />
        <Area label="Sous-texte CTA final" value={c.finalSubtext} onChange={(v) => set({ finalSubtext: v })} />
        <Text label="Bouton CTA final" value={c.finalCta} onChange={(v) => set({ finalCta: v })} />
        <Text label="Mention sous le CTA final" value={c.finalFinePrint} onChange={(v) => set({ finalFinePrint: v })} />
        <Text label="Pied de page" value={c.footer} onChange={(v) => set({ footer: v })} />
      </Section>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-neutral-200 bg-white/95 py-3 backdrop-blur">
        <Button onClick={save} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {msg && (
          <span className={`text-sm font-semibold ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</span>
        )}
      </div>
    </div>
  );
}
