"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LANDING_MEDIA_BUCKET } from "@/lib/course-videos";
import { createLandingVideoUploadUrl } from "@/actions/landing-media";
import { updateArabicLandingContent } from "@/actions/arabic-landing-content";
import type { ArabicLandingContent } from "@/lib/arabic-landing-content";

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#e0b34a] focus:ring-2 focus:ring-[#e0b34a]/20";

function Field({
  label,
  value,
  onChange,
  area,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  area?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-500">
        {label}
      </span>
      {area ? (
        <textarea
          rows={3}
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
    </label>
  );
}

function NumberField({
  label,
  cents,
  onChange,
}: {
  label: string;
  cents: number;
  onChange: (cents: number) => void;
}) {
  // Edit in euros for convenience; store cents.
  const [text, setText] = useState((cents / 100).toString());
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-500">
        {label}
      </span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const euros = parseFloat(e.target.value);
          onChange(Number.isFinite(euros) ? Math.round(euros * 100) : 0);
        }}
        className={inputCls}
      />
    </label>
  );
}

function VideoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setErr(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const signed = await createLandingVideoUploadUrl(ext);
      if ("error" in signed) throw new Error(signed.error);
      const supabase = createClient();
      const { error } = await supabase.storage
        .from(LANDING_MEDIA_BUCKET)
        .uploadToSignedUrl(signed.path, signed.token, file, {
          contentType: file.type || "video/mp4",
        });
      if (error) throw new Error(error.message);
      onChange(signed.publicUrl);
    } catch (e: any) {
      setErr(e?.message || "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-500">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="URL vidéo (YouTube, Vimeo ou fichier .mp4)"
        className={inputCls}
      />
      <div className="mt-1 flex items-center gap-3">
        <label className="cursor-pointer text-xs font-semibold text-[#b5891f] hover:underline">
          {uploading ? "Upload en cours…" : "Téléverser une vidéo (mp4)"}
          <input
            type="file"
            accept="video/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs font-semibold text-rose-500 hover:underline"
          >
            Retirer
          </button>
        )}
        {err && <span className="text-xs text-rose-500">{err}</span>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
      <h3 className="mb-3 text-sm font-bold text-neutral-800">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-neutral-500">
        {label} (un par ligne)
      </span>
      <textarea
        rows={Math.min(14, Math.max(4, items.length + 1))}
        value={items.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").filter((l) => l.length > 0))}
        className={inputCls}
      />
    </div>
  );
}

const TABS = [
  ["hero", "Hero"],
  ["trust", "Confiance"],
  ["testimonials", "Témoignages"],
  ["pricing", "Tarif"],
  ["method", "Méthode"],
  ["program", "Programme (21)"],
  ["comparison", "Comparatif"],
  ["faq", "FAQ"],
  ["sticky", "Barre sticky"],
] as const;
type TabKey = (typeof TABS)[number][0];

export function ArabicLandingForm({ initial }: { initial: ArabicLandingContent }) {
  const router = useRouter();
  const [c, setC] = useState<ArabicLandingContent>(initial);
  const [tab, setTab] = useState<TabKey>("hero");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const patch = <K extends keyof ArabicLandingContent>(
    key: K,
    value: Partial<ArabicLandingContent[K]>,
  ) => setC((p) => ({ ...p, [key]: { ...(p[key] as object), ...value } }));

  const onSave = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await updateArabicLandingContent(c);
      if (res?.error) setMsg({ ok: false, text: res.error });
      else {
        setMsg({ ok: true, text: "Landing mise à jour ✓" });
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-neutral-800">
        Contenu de la landing (/lire-larabe)
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Choisis une section, modifie-la, puis « Mettre à jour ».
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              tab === key
                ? "bg-[#e0b34a] text-neutral-900"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4 pb-20">
        {tab === "hero" && (
          <Section title="Hero">
            <Field label="Pastille" value={c.hero.badge} onChange={(v) => patch("hero", { badge: v })} />
            <Field label="Titre — début" value={c.hero.titleLead} onChange={(v) => patch("hero", { titleLead: v })} />
            <Field label="Titre — mot doré" value={c.hero.titleHighlight} onChange={(v) => patch("hero", { titleHighlight: v })} />
            <Field label="Titre — fin (ex : ?). Laisse vide pour aucun signe" value={c.hero.titleTail} onChange={(v) => patch("hero", { titleTail: v })} />
            <Field label="Sous-titre" area value={c.hero.subtitle} onChange={(v) => patch("hero", { subtitle: v })} />
            <VideoField label="Vidéo de présentation" value={c.hero.videoUrl} onChange={(v) => patch("hero", { videoUrl: v })} />
            <Field label="Texte affiché si pas de vidéo" value={c.hero.videoLabel} onChange={(v) => patch("hero", { videoLabel: v })} />
            <Field label="Bouton (CTA hero)" value={c.hero.ctaLabel} onChange={(v) => patch("hero", { ctaLabel: v })} />
          </Section>
        )}

        {tab === "trust" && (
          <Section title="Barre de confiance (3 éléments)">
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Field
                  key={i}
                  label={`Élément ${i + 1}`}
                  value={c.trust[i] ?? ""}
                  onChange={(v) => {
                    const next = [...c.trust];
                    next[i] = v;
                    setC((p) => ({ ...p, trust: next }));
                  }}
                />
              ))}
            </div>
          </Section>
        )}

        {tab === "testimonials" && (
          <Section title="Témoignages (vidéos)">
            <Field label="Titre" value={c.testimonials.heading} onChange={(v) => patch("testimonials", { heading: v })} />
            <Field label="Sous-titre" value={c.testimonials.subheading} onChange={(v) => patch("testimonials", { subheading: v })} />
            {c.testimonials.items.map((t, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">Témoignage {i + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      patch("testimonials", {
                        items: c.testimonials.items.filter((_, j) => j !== i),
                      })
                    }
                    className="text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
                <VideoField
                  label="Vidéo"
                  value={t.videoUrl}
                  onChange={(v) =>
                    patch("testimonials", {
                      items: c.testimonials.items.map((x, j) => (j === i ? { ...x, videoUrl: v } : x)),
                    })
                  }
                />
                <Field
                  label="Texte affiché si pas de vidéo"
                  value={t.label}
                  onChange={(v) =>
                    patch("testimonials", {
                      items: c.testimonials.items.map((x, j) => (j === i ? { ...x, label: v } : x)),
                    })
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                patch("testimonials", {
                  items: [...c.testimonials.items, { videoUrl: "", label: "Témoignage (à venir)" }],
                })
              }
              className="text-xs font-semibold text-[#b5891f] hover:underline"
            >
              + Ajouter un témoignage
            </button>
          </Section>
        )}

        {tab === "pricing" && (
          <Section title="Tarif">
            <Field label="Titre" value={c.pricing.heading} onChange={(v) => patch("pricing", { heading: v })} />
            <Field label="Sous-titre" value={c.pricing.subheading} onChange={(v) => patch("pricing", { subheading: v })} />
            <Field label="Pastille (carte)" value={c.pricing.badge} onChange={(v) => patch("pricing", { badge: v })} />
            <Field label="Note (sous la pastille)" value={c.pricing.cycleNote} onChange={(v) => patch("pricing", { cycleNote: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="Prix payé (€)" cents={c.pricing.priceCents} onChange={(cents) => patch("pricing", { priceCents: cents })} />
              <NumberField label="Prix barré (€)" cents={c.pricing.compareAtCents} onChange={(cents) => patch("pricing", { compareAtCents: cents })} />
            </div>
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              ⚠️ Le « Prix payé » modifie aussi le montant réellement débité au
              checkout Stripe.
            </p>
            <Field label="Texte d'économie" value={c.pricing.savingLabel} onChange={(v) => patch("pricing", { savingLabel: v })} />
            <ListEditor label="Avantages inclus" items={c.pricing.features} onChange={(features) => patch("pricing", { features })} />
            <Field label="Libellé du bouton" value={c.pricing.buttonLabel} onChange={(v) => patch("pricing", { buttonLabel: v })} />
            <Field label="Petit texte DANS le bouton (ex : Paiement sécurisé · Garantie 14 jours)" value={c.pricing.buttonSub} onChange={(v) => patch("pricing", { buttonSub: v })} />
            <Field label="Mention sécurité (sous le bouton)" value={c.pricing.secure} onChange={(v) => patch("pricing", { secure: v })} />
          </Section>
        )}

        {tab === "method" && (
          <Section title="Méthode (4 étapes)">
            <Field label="Sur-titre" value={c.method.eyebrow} onChange={(v) => patch("method", { eyebrow: v })} />
            <Field label="Titre" value={c.method.heading} onChange={(v) => patch("method", { heading: v })} />
            <Field label="Sous-titre" area value={c.method.subheading} onChange={(v) => patch("method", { subheading: v })} />
            {c.method.steps.map((s, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">Étape {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => patch("method", { steps: c.method.steps.filter((_, j) => j !== i) })}
                    className="text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-[90px_1fr]">
                  <Field
                    label="N°"
                    value={s.n}
                    onChange={(v) => patch("method", { steps: c.method.steps.map((x, j) => (j === i ? { ...x, n: v } : x)) })}
                  />
                  <Field
                    label="Titre"
                    value={s.title}
                    onChange={(v) => patch("method", { steps: c.method.steps.map((x, j) => (j === i ? { ...x, title: v } : x)) })}
                  />
                </div>
                <Field
                  label="Texte"
                  area
                  value={s.text}
                  onChange={(v) => patch("method", { steps: c.method.steps.map((x, j) => (j === i ? { ...x, text: v } : x)) })}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => patch("method", { steps: [...c.method.steps, { n: "", title: "", text: "" }] })}
              className="text-xs font-semibold text-[#b5891f] hover:underline"
            >
              + Ajouter une étape
            </button>
          </Section>
        )}

        {tab === "program" && (
          <Section title="Programme — liste des chapitres">
            <Field label="Titre" value={c.program.heading} onChange={(v) => patch("program", { heading: v })} />
            <ListEditor label="Chapitres" items={c.program.chapters} onChange={(chapters) => patch("program", { chapters })} />
          </Section>
        )}

        {tab === "comparison" && (
          <Section title="Comparatif">
            <Field label="Titre" value={c.comparison.heading} onChange={(v) => patch("comparison", { heading: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Field label="Colonne « classiques » — titre" value={c.comparison.classicTitle} onChange={(v) => patch("comparison", { classicTitle: v })} />
                <ListEditor label="Points (classiques)" items={c.comparison.classic} onChange={(classic) => patch("comparison", { classic })} />
              </div>
              <div className="space-y-2">
                <Field label="Colonne « Quranlab » — titre" value={c.comparison.oursTitle} onChange={(v) => patch("comparison", { oursTitle: v })} />
                <ListEditor label="Points (Quranlab)" items={c.comparison.ours} onChange={(ours) => patch("comparison", { ours })} />
              </div>
            </div>
          </Section>
        )}

        {tab === "faq" && (
          <Section title="FAQ">
            <Field label="Titre" value={c.faq.heading} onChange={(v) => patch("faq", { heading: v })} />
            {c.faq.items.map((it, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500">Question {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => patch("faq", { items: c.faq.items.filter((_, j) => j !== i) })}
                    className="text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
                <Field label="Question" value={it.q} onChange={(v) => patch("faq", { items: c.faq.items.map((x, j) => (j === i ? { ...x, q: v } : x)) })} />
                <Field label="Réponse" area value={it.a} onChange={(v) => patch("faq", { items: c.faq.items.map((x, j) => (j === i ? { ...x, a: v } : x)) })} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => patch("faq", { items: [...c.faq.items, { q: "", a: "" }] })}
              className="text-xs font-semibold text-[#b5891f] hover:underline"
            >
              + Ajouter une question
            </button>
          </Section>
        )}

        {tab === "sticky" && (
          <Section title="Barre flottante (bas de page)">
            <Field label="Texte (avant le compte à rebours)" value={c.sticky.label} onChange={(v) => patch("sticky", { label: v })} />
            <Field label="Bouton" value={c.sticky.ctaLabel} onChange={(v) => patch("sticky", { ctaLabel: v })} />
          </Section>
        )}
      </div>

      <div className="sticky bottom-0 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 flex items-center gap-3 rounded-b-2xl border-t border-neutral-200 bg-white/95 px-5 sm:px-6 py-3 backdrop-blur">
        <Button variant="primary" disabled={pending} onClick={onSave}>
          {pending ? "Mise à jour…" : "Mettre à jour la landing"}
        </Button>
        {msg && (
          <span className={`text-sm font-medium ${msg.ok ? "text-emerald-600" : "text-rose-500"}`}>
            {msg.text}
          </span>
        )}
        <span className="ml-auto text-xs text-neutral-400">
          Section : {TABS.find((t) => t[0] === tab)?.[1]}
        </span>
      </div>
    </div>
  );
}
