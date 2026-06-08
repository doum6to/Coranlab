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
import { LANDING_SECTIONS } from "@/lib/landing-sections";

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
      const text = await res.text();
      let data: { url?: string; error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text.slice(0, 140) || `Erreur ${res.status}` };
      }
      if (res.status === 413) {
        throw new Error("Image trop lourde (> ~4,5 Mo). Compresse-la et réessaie.");
      }
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      if (!data.url) throw new Error("Réponse inattendue du serveur.");
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

const TABS = [
  ["sections", "Sections (afficher/masquer)"],
  ["hero", "Hero"],
  ["trust", "Confiance"],
  ["rows", "Sections"],
  ["value", "Pack & bonus"],
  ["story", "Texte de vente"],
  ["tarif", "Tarif"],
  ["offer", "Carte d'offre"],
  ["reviews", "Avis"],
  ["faq", "FAQ"],
  ["final", "CTA final"],
  ["letter", "Lettre (V2)"],
  ["product", "Produit (V3)"],
] as const;
type TabKey = (typeof TABS)[number][0];

export function LandingContentForm({ initial }: { initial: LandingContent }) {
  const router = useRouter();
  const [c, setC] = useState<LandingContent>(initial);
  const [tab, setTab] = useState<TabKey>("hero");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // Generic helpers to update slices immutably.
  const patch = <K extends keyof LandingContent>(
    key: K,
    value: Partial<LandingContent[K]>,
  ) => setC((p) => ({ ...p, [key]: { ...(p[key] as object), ...value } }));

  const setRows = (rows: LandingRow[]) => setC((p) => ({ ...p, rows }));
  const setTrust = (trust: string[]) => setC((p) => ({ ...p, trust }));
  const story = c.story;
  const setStory = (v: Partial<LandingContent["story"]>) => patch("story", v);
  const letter = c.letter;
  const setLetter = (v: Partial<LandingContent["letter"]>) =>
    patch("letter", v);
  const prod = c.product;
  const setProd = (v: Partial<LandingContent["product"]>) =>
    patch("product", v);

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
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold text-neutral-800">
        Contenu de la landing (/offre-a-vie)
      </h2>
      <p className="mb-4 text-sm text-neutral-500">
        Choisis une section, modifie-la, puis « Mettre à jour ».
      </p>

      {/* section tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              tab === key
                ? "bg-[#6967fb] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4 pb-20">
        {/* SECTIONS VISIBILITY */}
        {tab === "sections" && (
        <Section title="Sections de la page (afficher / masquer)">
          <p className="text-sm text-neutral-500">
            Décoche une section pour la masquer. Les sections sont regroupées
            par variante de landing (Classique / Lettre / Produit).
          </p>
          {LANDING_SECTIONS.map((grp) => (
            <div key={grp.group} className="mt-2">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
                {grp.group}
              </p>
              <div className="space-y-2">
                {grp.items.map((s) => {
                  const visible = !(c.hidden ?? []).includes(s.key);
                  return (
                    <label
                      key={s.key}
                      className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3"
                    >
                      <span className="text-sm font-semibold text-neutral-800">
                        {s.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={(e) => {
                          const cur = new Set(c.hidden ?? []);
                          if (e.target.checked) cur.delete(s.key);
                          else cur.add(s.key);
                          setC((p) => ({ ...p, hidden: Array.from(cur) }));
                        }}
                        className="h-5 w-5 rounded border-neutral-300"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </Section>
        )}

        {/* HERO */}
        {tab === "hero" && (
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
        )}

        {/* TRUST */}
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
                  setTrust(next);
                }}
              />
            ))}
          </div>
        </Section>
        )}

        {/* ROWS */}
        {tab === "rows" && (
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
        )}

        {/* VALUE STACK */}
        {tab === "value" && (
        <Section title="Pack & bonus (ce que tu reçois)">
          <Field
            label="Sur-titre"
            value={c.valueStack.eyebrow}
            onChange={(v) => patch("valueStack", { eyebrow: v })}
          />
          <Field
            label="Titre"
            value={c.valueStack.heading}
            onChange={(v) => patch("valueStack", { heading: v })}
          />
          <Field
            label="Intro"
            area
            value={c.valueStack.intro}
            onChange={(v) => patch("valueStack", { intro: v })}
          />
          {c.valueStack.items.map((it, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">
                  Élément {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    patch("valueStack", {
                      items: c.valueStack.items.filter((_, j) => j !== i),
                    })
                  }
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-[120px_1fr_90px]">
                <Field
                  label="Badge"
                  value={it.badge}
                  onChange={(v) =>
                    patch("valueStack", {
                      items: c.valueStack.items.map((x, j) =>
                        j === i ? { ...x, badge: v } : x,
                      ),
                    })
                  }
                />
                <Field
                  label="Titre"
                  value={it.title}
                  onChange={(v) =>
                    patch("valueStack", {
                      items: c.valueStack.items.map((x, j) =>
                        j === i ? { ...x, title: v } : x,
                      ),
                    })
                  }
                />
                <Field
                  label="Valeur"
                  value={it.value}
                  onChange={(v) =>
                    patch("valueStack", {
                      items: c.valueStack.items.map((x, j) =>
                        j === i ? { ...x, value: v } : x,
                      ),
                    })
                  }
                />
              </div>
              <Field
                label="Description"
                area
                value={it.description}
                onChange={(v) =>
                  patch("valueStack", {
                    items: c.valueStack.items.map((x, j) =>
                      j === i ? { ...x, description: v } : x,
                    ),
                  })
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patch("valueStack", {
                items: [
                  ...c.valueStack.items,
                  { badge: "BONUS", title: "", description: "", value: "" },
                ],
              })
            }
            className="text-xs font-semibold text-brilliant-green hover:underline"
          >
            + Ajouter un élément
          </button>
        </Section>
        )}

        {/* STORY */}
        {tab === "story" && (
        <Section title="Texte de vente (page longue)">
          <Field
            label="Accroche — titre"
            area
            value={story.hookHeading}
            onChange={(v) => setStory({ hookHeading: v })}
          />
          <Field
            label="Accroche — texte (paragraphes séparés par une ligne vide)"
            area
            value={story.hookBody}
            onChange={(v) => setStory({ hookBody: v })}
          />
          <Field
            label="Schéma ignoré — titre"
            value={story.patternHeading}
            onChange={(v) => setStory({ patternHeading: v })}
          />
          <Field
            label="Schéma ignoré — texte"
            area
            value={story.patternBody}
            onChange={(v) => setStory({ patternBody: v })}
          />
          <Field
            label="Pourquoi ça échoue — titre"
            value={story.whyHeading}
            onChange={(v) => setStory({ whyHeading: v })}
          />
          {story.discoveries.map((d, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">
                  Découverte {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setStory({
                      discoveries: story.discoveries.filter((_, j) => j !== i),
                    })
                  }
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
              <Field
                label="Titre"
                value={d.title}
                onChange={(v) =>
                  setStory({
                    discoveries: story.discoveries.map((x, j) =>
                      j === i ? { ...x, title: v } : x,
                    ),
                  })
                }
              />
              <Field
                label="Texte"
                area
                value={d.text}
                onChange={(v) =>
                  setStory({
                    discoveries: story.discoveries.map((x, j) =>
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
              setStory({
                discoveries: [...story.discoveries, { title: "", text: "" }],
              })
            }
            className="text-xs font-semibold text-brilliant-green hover:underline"
          >
            + Ajouter une découverte
          </button>

          <Field
            label="Méthode — sur-titre"
            value={story.methodEyebrow}
            onChange={(v) => setStory({ methodEyebrow: v })}
          />
          <Field
            label="Méthode — titre"
            value={story.methodHeading}
            onChange={(v) => setStory({ methodHeading: v })}
          />
          <Field
            label="Méthode — texte"
            area
            value={story.methodBody}
            onChange={(v) => setStory({ methodBody: v })}
          />
          {story.steps.map((s, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">
                  Étape {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setStory({ steps: story.steps.filter((_, j) => j !== i) })
                  }
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-[110px_1fr]">
                <Field
                  label="Label"
                  value={s.label}
                  onChange={(v) =>
                    setStory({
                      steps: story.steps.map((x, j) =>
                        j === i ? { ...x, label: v } : x,
                      ),
                    })
                  }
                />
                <Field
                  label="Titre"
                  value={s.title}
                  onChange={(v) =>
                    setStory({
                      steps: story.steps.map((x, j) =>
                        j === i ? { ...x, title: v } : x,
                      ),
                    })
                  }
                />
              </div>
              <Field
                label="Texte"
                area
                value={s.text}
                onChange={(v) =>
                  setStory({
                    steps: story.steps.map((x, j) =>
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
              setStory({
                steps: [...story.steps, { label: "Étape", title: "", text: "" }],
              })
            }
            className="text-xs font-semibold text-brilliant-green hover:underline"
          >
            + Ajouter une étape
          </button>

          <Field
            label="Avantages — titre"
            value={story.perksHeading}
            onChange={(v) => setStory({ perksHeading: v })}
          />
          <div>
            <span className="mb-1 block text-xs font-semibold text-neutral-500">
              Avantages (un par ligne)
            </span>
            <textarea
              rows={6}
              value={story.perks.join("\n")}
              onChange={(e) =>
                setStory({ perks: e.target.value.split("\n").filter(Boolean) })
              }
              className={inputCls}
            />
          </div>

          <Field
            label="Pourquoi ça marche — titre"
            value={story.whyWorksHeading}
            onChange={(v) => setStory({ whyWorksHeading: v })}
          />
          <Field
            label="Pourquoi ça marche — texte"
            area
            value={story.whyWorksBody}
            onChange={(v) => setStory({ whyWorksBody: v })}
          />

          <Field
            label="Science — titre"
            value={story.scienceHeading}
            onChange={(v) => setStory({ scienceHeading: v })}
          />
          {story.science.map((s, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <Field
                label={`Chiffre ${i + 1}`}
                value={s.k}
                onChange={(v) =>
                  setStory({
                    science: story.science.map((x, j) =>
                      j === i ? { ...x, k: v } : x,
                    ),
                  })
                }
              />
              <Field
                label="Détail"
                value={s.v}
                onChange={(v) =>
                  setStory({
                    science: story.science.map((x, j) =>
                      j === i ? { ...x, v } : x,
                    ),
                  })
                }
              />
            </div>
          ))}
          <Field
            label="Science — note"
            area
            value={story.scienceNote}
            onChange={(v) => setStory({ scienceNote: v })}
          />

          <Field
            label="Prix — titre"
            value={story.priceHeading}
            onChange={(v) => setStory({ priceHeading: v })}
          />
          <Field
            label="Prix — texte"
            area
            value={story.priceBody}
            onChange={(v) => setStory({ priceBody: v })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Bouton (CTA)"
              value={story.ctaLabel}
              onChange={(v) => setStory({ ctaLabel: v })}
            />
            <Field
              label="Sous-texte du bouton"
              value={story.ctaSub}
              onChange={(v) => setStory({ ctaSub: v })}
            />
          </div>
        </Section>
        )}

        {/* PRICE ANCHOR */}
        {tab === "tarif" && (
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
        )}

        {/* OFFER */}
        {tab === "offer" && (
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
              label="Petit texte DANS le bouton (ex : Paiement sécurisé · Garantie 14 jours)"
              value={c.offer.buttonSub}
              onChange={(v) => patch("offer", { buttonSub: v })}
            />
            <Field
              label="Mention paiement sécurisé"
              value={c.offer.secure}
              onChange={(v) => patch("offer", { secure: v })}
            />
            <Field
              label="Libellé barre flottante (bas)"
              value={c.offer.stickyLabel}
              onChange={(v) => patch("offer", { stickyLabel: v })}
            />
          </div>
        </Section>
        )}

        {/* REVIEWS */}
        {tab === "reviews" && (
        <Section title="Avis">
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

          {/* TikTok screenshots → infinite marquee */}
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <p className="mb-1 text-sm font-bold text-neutral-800">
              Captures d&apos;avis TikTok (carrousel défilant)
            </p>
            <p className="mb-3 text-xs text-neutral-500">
              Téléverse tes captures d&apos;écran. Dès qu&apos;il y en a au moins
              une, elles remplacent les avis écrits et défilent en boucle.
            </p>
            <div className="space-y-2">
              {c.reviews.screenshots.map((g, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1">
                    <ImageField
                      label={`Capture ${i + 1}`}
                      value={g}
                      onChange={(v) =>
                        patch("reviews", {
                          screenshots: c.reviews.screenshots.map((x, j) =>
                            j === i ? v : x,
                          ),
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      patch("reviews", {
                        screenshots: c.reviews.screenshots.filter(
                          (_, j) => j !== i,
                        ),
                      })
                    }
                    className="pb-2 text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Suppr.
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  patch("reviews", {
                    screenshots: [...c.reviews.screenshots, ""],
                  })
                }
                className="text-xs font-semibold text-brilliant-green hover:underline"
              >
                + Ajouter une capture
              </button>
            </div>
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
        )}

        {/* FAQ */}
        {tab === "faq" && (
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
        )}

        {/* FINAL CTA */}
        {tab === "final" && (
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
        )}

        {/* LETTER (V2) */}
        {tab === "letter" && (
        <Section title="Lettre (version 2) — active via « Offre & prix »">
          <Field
            label="Salutation"
            value={letter.greeting}
            onChange={(v) => setLetter({ greeting: v })}
          />
          <Field
            label="Intro (paragraphes séparés par une ligne vide)"
            area
            value={letter.intro}
            onChange={(v) => setLetter({ intro: v })}
          />
          <Field
            label="Phrase « méthode »"
            value={letter.methodLine}
            onChange={(v) => setLetter({ methodLine: v })}
          />
          <ImageField
            label="Image 1"
            value={letter.image1}
            onChange={(v) => setLetter({ image1: v })}
          />
          <Field
            label="Bloc « ce que j'ai compris » — titre"
            value={letter.insightHeading}
            onChange={(v) => setLetter({ insightHeading: v })}
          />
          <Field
            label="Bloc « ce que j'ai compris » — texte"
            area
            value={letter.insightBody}
            onChange={(v) => setLetter({ insightBody: v })}
          />
          <ImageField
            label="Image 2"
            value={letter.image2}
            onChange={(v) => setLetter({ image2: v })}
          />
          <Field
            label="Bloc « comment ça se passe » — titre"
            value={letter.howHeading}
            onChange={(v) => setLetter({ howHeading: v })}
          />
          <Field
            label="Bloc « comment ça se passe » — texte"
            area
            value={letter.howBody}
            onChange={(v) => setLetter({ howBody: v })}
          />
          <Field
            label="Bonus — titre de section"
            value={letter.bonusesHeading}
            onChange={(v) => setLetter({ bonusesHeading: v })}
          />
          <ImageField
            label="Image des 3 livres (bundle)"
            value={letter.bonusesImage}
            onChange={(v) => setLetter({ bonusesImage: v })}
          />
          {letter.bonuses.map((b, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">
                  Bonus {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setLetter({
                      bonuses: letter.bonuses.filter((_, j) => j !== i),
                    })
                  }
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
              <Field
                label="Titre"
                value={b.title}
                onChange={(v) =>
                  setLetter({
                    bonuses: letter.bonuses.map((x, j) =>
                      j === i ? { ...x, title: v } : x,
                    ),
                  })
                }
              />
              <ImageField
                label="Image"
                value={b.image}
                onChange={(v) =>
                  setLetter({
                    bonuses: letter.bonuses.map((x, j) =>
                      j === i ? { ...x, image: v } : x,
                    ),
                  })
                }
              />
              <Field
                label="Description"
                area
                value={b.description}
                onChange={(v) =>
                  setLetter({
                    bonuses: letter.bonuses.map((x, j) =>
                      j === i ? { ...x, description: v } : x,
                    ),
                  })
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setLetter({
                bonuses: [
                  ...letter.bonuses,
                  { title: "", image: "", description: "" },
                ],
              })
            }
            className="text-xs font-semibold text-brilliant-green hover:underline"
          >
            + Ajouter un bonus
          </button>
          <Field
            label="Conclusion"
            area
            value={letter.closing}
            onChange={(v) => setLetter({ closing: v })}
          />
          <Field
            label="Bouton final (CTA)"
            value={letter.ctaLabel}
            onChange={(v) => setLetter({ ctaLabel: v })}
          />
        </Section>
        )}

        {/* PRODUCT (V3) */}
        {tab === "product" && (
        <Section title="Produit (version 3) — active via « Offre & prix »">
          <Field
            label="Titre"
            value={prod.title}
            onChange={(v) => setProd({ title: v })}
          />
          <Field
            label="Sous-titre"
            area
            value={prod.subtitle}
            onChange={(v) => setProd({ subtitle: v })}
          />
          <Field
            label="Note / avis (ex. 4,9/5 · 1 000+ avis)"
            value={prod.rating}
            onChange={(v) => setProd({ rating: v })}
          />

          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <span className="mb-2 block text-xs font-bold text-neutral-500">
              Galerie d&apos;images (la 1ère = image principale)
            </span>
            <div className="space-y-2">
              {prod.gallery.map((g, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1">
                    <ImageField
                      label={`Image ${i + 1}`}
                      value={g}
                      onChange={(v) =>
                        setProd({
                          gallery: prod.gallery.map((x, j) =>
                            j === i ? v : x,
                          ),
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setProd({
                        gallery: prod.gallery.filter((_, j) => j !== i),
                      })
                    }
                    className="pb-2 text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Suppr.
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProd({ gallery: [...prod.gallery, ""] })}
                className="text-xs font-semibold text-brilliant-green hover:underline"
              >
                + Ajouter une image
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={prod.showThumbnails}
              onChange={(e) => setProd({ showThumbnails: e.target.checked })}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Afficher les miniatures sous le carrousel
          </label>

          <div>
            <span className="mb-1 block text-xs font-semibold text-neutral-500">
              Points clés (un par ligne)
            </span>
            <textarea
              rows={4}
              value={prod.bullets.join("\n")}
              onChange={(e) =>
                setProd({ bullets: e.target.value.split("\n").filter(Boolean) })
              }
              className={inputCls}
            />
          </div>
          <Field
            label="Ligne de réassurance (sous le bouton)"
            value={prod.guarantee}
            onChange={(v) => setProd({ guarantee: v })}
          />

          <Field
            label="Bénéfices — titre"
            value={prod.benefitsHeading}
            onChange={(v) => setProd({ benefitsHeading: v })}
          />
          {prod.benefits.map((b, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">
                  Bénéfice {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setProd({
                      benefits: prod.benefits.filter((_, j) => j !== i),
                    })
                  }
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
              <Field
                label="Titre"
                value={b.title}
                onChange={(v) =>
                  setProd({
                    benefits: prod.benefits.map((x, j) =>
                      j === i ? { ...x, title: v } : x,
                    ),
                  })
                }
              />
              <Field
                label="Texte"
                area
                value={b.text}
                onChange={(v) =>
                  setProd({
                    benefits: prod.benefits.map((x, j) =>
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
              setProd({
                benefits: [...prod.benefits, { title: "", text: "" }],
              })
            }
            className="text-xs font-semibold text-brilliant-green hover:underline"
          >
            + Ajouter un bénéfice
          </button>

          <Field
            label="« Ce que tu reçois » — titre"
            value={prod.insideHeading}
            onChange={(v) => setProd({ insideHeading: v })}
          />
          {prod.insideItems.map((it, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">
                  Élément {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setProd({
                      insideItems: prod.insideItems.filter((_, j) => j !== i),
                    })
                  }
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
              <ImageField
                label="Image"
                value={it.image}
                onChange={(v) =>
                  setProd({
                    insideItems: prod.insideItems.map((x, j) =>
                      j === i ? { ...x, image: v } : x,
                    ),
                  })
                }
              />
              <Field
                label="Titre"
                value={it.title}
                onChange={(v) =>
                  setProd({
                    insideItems: prod.insideItems.map((x, j) =>
                      j === i ? { ...x, title: v } : x,
                    ),
                  })
                }
              />
              <Field
                label="Texte"
                area
                value={it.text}
                onChange={(v) =>
                  setProd({
                    insideItems: prod.insideItems.map((x, j) =>
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
              setProd({
                insideItems: [
                  ...prod.insideItems,
                  { image: "", title: "", text: "" },
                ],
              })
            }
            className="text-xs font-semibold text-brilliant-green hover:underline"
          >
            + Ajouter un élément
          </button>

          <Field
            label="Étapes — titre"
            value={prod.howHeading}
            onChange={(v) => setProd({ howHeading: v })}
          />
          {prod.steps.map((s, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500">
                  Étape {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setProd({ steps: prod.steps.filter((_, j) => j !== i) })
                  }
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
              <Field
                label="Titre"
                value={s.title}
                onChange={(v) =>
                  setProd({
                    steps: prod.steps.map((x, j) =>
                      j === i ? { ...x, title: v } : x,
                    ),
                  })
                }
              />
              <Field
                label="Texte"
                area
                value={s.text}
                onChange={(v) =>
                  setProd({
                    steps: prod.steps.map((x, j) =>
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
              setProd({ steps: [...prod.steps, { title: "", text: "" }] })
            }
            className="text-xs font-semibold text-brilliant-green hover:underline"
          >
            + Ajouter une étape
          </button>

          <Field
            label="Comparatif — titre"
            value={prod.compareHeading}
            onChange={(v) => setProd({ compareHeading: v })}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Field
              label="Colonne « nous »"
              value={prod.compareUs}
              onChange={(v) => setProd({ compareUs: v })}
            />
            <Field
              label="Colonne « eux »"
              value={prod.compareThem}
              onChange={(v) => setProd({ compareThem: v })}
            />
          </div>
          <div>
            <span className="mb-1 block text-xs font-semibold text-neutral-500">
              Lignes du comparatif (une par ligne)
            </span>
            <textarea
              rows={5}
              value={prod.compareRows.join("\n")}
              onChange={(e) =>
                setProd({
                  compareRows: e.target.value.split("\n").filter(Boolean),
                })
              }
              className={inputCls}
            />
          </div>

          <Field
            label="Fondateur — titre"
            value={prod.founderHeading}
            onChange={(v) => setProd({ founderHeading: v })}
          />
          <Field
            label="Fondateur — texte"
            area
            value={prod.founderText}
            onChange={(v) => setProd({ founderText: v })}
          />
          <ImageField
            label="Fondateur — image"
            value={prod.founderImage}
            onChange={(v) => setProd({ founderImage: v })}
          />
        </Section>
        )}
      </div>

      {/* sticky save bar */}
      <div className="sticky bottom-0 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 flex items-center gap-3 rounded-b-2xl border-t border-neutral-200 bg-white/95 px-5 sm:px-6 py-3 backdrop-blur">
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
        <span className="ml-auto text-xs text-neutral-400">
          Section : {TABS.find((t) => t[0] === tab)?.[1]}
        </span>
      </div>
    </div>
  );
}
