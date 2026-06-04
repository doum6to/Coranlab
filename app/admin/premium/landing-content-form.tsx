"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { updateLandingContent } from "@/actions/landing-content";
import type {
  LandingContent,
  LandingFaq,
  LandingReview,
  LandingRow,
} from "@/lib/landing-content";

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20";

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

function ImageField({
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
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'upload.");
      onChange(data.url);
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
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-14 w-14 shrink-0 rounded-lg border border-neutral-200 object-contain"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded-lg border border-dashed border-neutral-300" />
        )}
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL de l'image"
            className={inputCls}
          />
          <div className="mt-1 flex items-center gap-2">
            <label className="cursor-pointer text-xs font-semibold text-brilliant-green hover:underline">
              {uploading ? "Upload…" : "Téléverser une image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
              />
            </label>
            {err && <span className="text-xs text-rose-500">{err}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
      <h3 className="mb-3 text-sm font-bold text-neutral-800">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function LandingContentForm({ initial }: { initial: LandingContent }) {
  const router = useRouter();
  const [c, setC] = useState<LandingContent>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // Generic helpers to update slices immutably.
  const patch = <K extends keyof LandingContent>(
    key: K,
    value: Partial<LandingContent[K]>,
  ) => setC((p) => ({ ...p, [key]: { ...(p[key] as object), ...value } }));

  const setRows = (rows: LandingRow[]) => setC((p) => ({ ...p, rows }));
  const setTrust = (trust: string[]) => setC((p) => ({ ...p, trust }));

  const onSave = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await updateLandingContent(c);
      if (res?.error) setMsg({ ok: false, text: res.error });
      else {
        setMsg({ ok: true, text: "Contenu mis à jour ✓" });
        router.refresh();
      }
    });
  };

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-neutral-800">
        Contenu de la landing (/offre-a-vie)
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Modifie textes, illustrations, avis et FAQ, puis « Mettre à jour ».
      </p>

      <div className="space-y-4">
        {/* HERO */}
        <Section title="Hero">
          <Field
            label="Pastille (preuve sociale)"
            value={c.hero.socialProof}
            onChange={(v) => patch("hero", { socialProof: v })}
          />
          <Field
            label="Titre — début"
            value={c.hero.titleLead}
            onChange={(v) => patch("hero", { titleLead: v })}
          />
          <Field
            label="Titre — mot surligné"
            value={c.hero.titleHighlight}
            onChange={(v) => patch("hero", { titleHighlight: v })}
          />
          <Field
            label="Sous-titre"
            area
            value={c.hero.subtitle}
            onChange={(v) => patch("hero", { subtitle: v })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Bouton principal"
              value={c.hero.ctaPrimary}
              onChange={(v) => patch("hero", { ctaPrimary: v })}
            />
            <Field
              label="Bouton secondaire"
              value={c.hero.ctaSecondary}
              onChange={(v) => patch("hero", { ctaSecondary: v })}
            />
          </div>
        </Section>

        {/* TRUST */}
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
                  setTrust(next);
                }}
              />
            ))}
          </div>
        </Section>

        {/* ROWS */}
        <Section title="Sections explicatives">
          {c.rows.map((row, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">
                  Section {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setRows(c.rows.filter((_, j) => j !== i))
                  }
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
              <ImageField
                label="Illustration"
                value={row.image}
                onChange={(v) =>
                  setRows(
                    c.rows.map((r, j) => (j === i ? { ...r, image: v } : r)),
                  )
                }
              />
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <Field
                  label="Titre"
                  value={row.title}
                  onChange={(v) =>
                    setRows(
                      c.rows.map((r, j) =>
                        j === i ? { ...r, title: v } : r,
                      ),
                    )
                  }
                />
                <Field
                  label="Couleur (blob)"
                  value={row.tint}
                  onChange={(v) =>
                    setRows(
                      c.rows.map((r, j) => (j === i ? { ...r, tint: v } : r)),
                    )
                  }
                />
              </div>
              <Field
                label="Texte"
                area
                value={row.text}
                onChange={(v) =>
                  setRows(
                    c.rows.map((r, j) => (j === i ? { ...r, text: v } : r)),
                  )
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setRows([
                ...c.rows,
                { image: "", tint: "#6967fb", title: "", text: "" },
              ])
            }
            className="text-xs font-semibold text-brilliant-green hover:underline"
          >
            + Ajouter une section
          </button>
        </Section>

        {/* PRICE ANCHOR */}
        <Section title="Bloc tarif (texte)">
          <Field
            label="Sur-titre"
            value={c.priceAnchor.eyebrow}
            onChange={(v) => patch("priceAnchor", { eyebrow: v })}
          />
          <Field
            label="Titre"
            value={c.priceAnchor.heading}
            onChange={(v) => patch("priceAnchor", { heading: v })}
          />
          <Field
            label="Texte"
            area
            value={c.priceAnchor.body}
            onChange={(v) => patch("priceAnchor", { body: v })}
          />
        </Section>

        {/* OFFER */}
        <Section title="Carte d'offre">
          <Field
            label="Sur-titre"
            value={c.offer.eyebrow}
            onChange={(v) => patch("offer", { eyebrow: v })}
          />
          <Field
            label="Note (sous le prix)"
            value={c.offer.cycleNote}
            onChange={(v) => patch("offer", { cycleNote: v })}
          />
          <div>
            <span className="mb-1 block text-xs font-semibold text-neutral-500">
              Avantages (un par ligne)
            </span>
            <textarea
              rows={5}
              value={c.offer.features.join("\n")}
              onChange={(e) =>
                patch("offer", {
                  features: e.target.value.split("\n").filter(Boolean),
                })
              }
              className={inputCls}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Libellé du bouton"
              value={c.offer.buttonLabel}
              onChange={(v) => patch("offer", { buttonLabel: v })}
            />
            <Field
              label="Mention paiement sécurisé"
              value={c.offer.secure}
              onChange={(v) => patch("offer", { secure: v })}
            />
          </div>
        </Section>

        {/* REVIEWS */}
        <Section title="Avis (en plus des captures TikTok)">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Sur-titre"
              value={c.reviews.eyebrow}
              onChange={(v) => patch("reviews", { eyebrow: v })}
            />
            <Field
              label="Titre"
              value={c.reviews.heading}
              onChange={(v) => patch("reviews", { heading: v })}
            />
          </div>
          {c.reviews.items.map((rv, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">
                  Avis {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    patch("reviews", {
                      items: c.reviews.items.filter((_, j) => j !== i),
                    })
                  }
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field
                  label="Auteur"
                  value={rv.author}
                  onChange={(v) =>
                    patch("reviews", {
                      items: c.reviews.items.map((x, j) =>
                        j === i ? { ...x, author: v } : x,
                      ),
                    })
                  }
                />
                <Field
                  label="@ (optionnel)"
                  value={rv.handle}
                  onChange={(v) =>
                    patch("reviews", {
                      items: c.reviews.items.map((x, j) =>
                        j === i ? { ...x, handle: v } : x,
                      ),
                    })
                  }
                />
              </div>
              <Field
                label="Texte de l'avis"
                area
                value={rv.text}
                onChange={(v) =>
                  patch("reviews", {
                    items: c.reviews.items.map((x, j) =>
                      j === i ? { ...x, text: v } : x,
                    ),
                  })
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patch("reviews", {
                items: [
                  ...c.reviews.items,
                  { author: "", handle: "", text: "" } as LandingReview,
                ],
              })
            }
            className="text-xs font-semibold text-brilliant-green hover:underline"
          >
            + Ajouter un avis
          </button>
        </Section>

        {/* FAQ */}
        <Section title="FAQ">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Sur-titre"
              value={c.faq.eyebrow}
              onChange={(v) => patch("faq", { eyebrow: v })}
            />
            <Field
              label="Titre"
              value={c.faq.heading}
              onChange={(v) => patch("faq", { heading: v })}
            />
          </div>
          {c.faq.items.map((it, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">
                  Question {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    patch("faq", {
                      items: c.faq.items.filter((_, j) => j !== i),
                    })
                  }
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
              <Field
                label="Question"
                value={it.q}
                onChange={(v) =>
                  patch("faq", {
                    items: c.faq.items.map((x, j) =>
                      j === i ? { ...x, q: v } : x,
                    ),
                  })
                }
              />
              <Field
                label="Réponse"
                area
                value={it.a}
                onChange={(v) =>
                  patch("faq", {
                    items: c.faq.items.map((x, j) =>
                      j === i ? { ...x, a: v } : x,
                    ),
                  })
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patch("faq", {
                items: [...c.faq.items, { q: "", a: "" } as LandingFaq],
              })
            }
            className="text-xs font-semibold text-brilliant-green hover:underline"
          >
            + Ajouter une question
          </button>
        </Section>

        {/* FINAL CTA */}
        <Section title="CTA final">
          <Field
            label="Titre"
            value={c.finalCta.heading}
            onChange={(v) => patch("finalCta", { heading: v })}
          />
          <Field
            label="Sous-titre"
            value={c.finalCta.subtitle}
            onChange={(v) => patch("finalCta", { subtitle: v })}
          />
        </Section>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button variant="primary" disabled={pending} onClick={onSave}>
          {pending ? "Mise à jour…" : "Mettre à jour la landing"}
        </Button>
        {msg && (
          <span
            className={`text-sm font-medium ${
              msg.ok ? "text-brilliant-green" : "text-rose-500"
            }`}
          >
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
