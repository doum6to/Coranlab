"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Type, GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateCoranLandingContent } from "@/actions/coran-landing-content";
import { CORAN_SECTION_LABELS } from "@/lib/coran-landing-content";
import type { CoranLandingContent, CoranBlock } from "@/lib/coran-landing-content";
import { compressImageFile } from "@/lib/images/compress-client";
import { createMediaUploadUrl } from "@/actions/landing-media";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20";

// Uploads up to 50 MB by going DIRECTLY to Supabase (signed URL), bypassing
// Vercel's ~4.5 MB body limit. Raster images are compressed client-side to a
// light WebP first; GIFs / PDFs are sent as-is (animation / document preserved).
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

async function uploadImage(file: File): Promise<string> {
  let f = file;
  const isRaster =
    file.type.startsWith("image/") &&
    file.type !== "image/gif" &&
    file.type !== "image/svg+xml";
  if (isRaster) {
    // Downscale + re-encode to WebP → a 50 MB photo becomes a few hundred KB.
    f = await compressImageFile(file, 2000, 0.85);
  }

  if (f.size > MAX_UPLOAD_BYTES) {
    throw new Error("Fichier trop lourd (max 50 Mo).");
  }

  const ext = (f.name.split(".").pop() || "bin").toLowerCase();
  const signed = await createMediaUploadUrl(ext, "coran");
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

function ImageUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-2">
      <label className="cursor-pointer text-xs font-semibold text-brilliant-green hover:underline">
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
              onUploaded(await uploadImage(f));
            } catch (e: any) {
              setErr(e?.message || "Échec.");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {err && <span className="text-xs text-rose-500">{err}</span>}
    </span>
  );
}

/** Like ImageUploadButton but for any accepted type (images, GIFs, PDFs). */
function FileUploadButton({
  onUploaded,
  accept = "image/*",
  label = "Téléverser",
}: {
  onUploaded: (url: string) => void;
  accept?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-2">
      <label className="cursor-pointer text-xs font-semibold text-brilliant-green hover:underline">
        {busy ? "Upload…" : label}
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={busy}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setErr(null);
            setBusy(true);
            try {
              onUploaded(await uploadImage(f));
            } catch (er: any) {
              setErr(er?.message || "Échec.");
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {err && <span className="text-xs text-rose-500">{err}</span>}
    </span>
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

type FormContent = CoranLandingContent & { driveLink?: string };

export function CoranLandingForm({
  initial,
  saveAction = updateCoranLandingContent,
  previewUrl = "/coran",
  showDriveLink = false,
}: {
  initial: FormContent;
  saveAction?: (c: any) => Promise<{ error?: string } | { ok: true } | void>;
  previewUrl?: string;
  showDriveLink?: boolean;
}) {
  const router = useRouter();
  const [c, setC] = useState<FormContent>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const moveSection = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const arr = [...c.sectionOrder];
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    setC({ ...c, sectionOrder: arr });
  };

  const euros = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
  const toCents = (s: string) => {
    const n = parseFloat(s.replace(",", "."));
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  };

  // Body block helpers
  const setBlock = (i: number, block: CoranBlock) =>
    setC({ ...c, body: c.body.map((b, idx) => (idx === i ? block : b)) });
  const moveBlock = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= c.body.length) return;
    const next = [...c.body];
    [next[i], next[j]] = [next[j], next[i]];
    setC({ ...c, body: next });
  };
  const rmBlock = (i: number) => setC({ ...c, body: c.body.filter((_, idx) => idx !== i) });

  // PDF preview (samples) helpers
  const setSample = (i: number, patch: Partial<CoranLandingContent["samples"][number]>) =>
    setC({ ...c, samples: c.samples.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  const addSample = () =>
    setC({ ...c, samples: [...c.samples, { cover: "", pdf: "", title: "" }] });
  const rmSample = (i: number) =>
    setC({ ...c, samples: c.samples.filter((_, idx) => idx !== i) });

  const onSave = () =>
    startTransition(async () => {
      setMsg(null);
      const res = (await saveAction(c)) as { error?: string } | undefined;
      if (res?.error) setMsg({ ok: false, text: res.error });
      else {
        setMsg({ ok: true, text: "Enregistré ✓" });
        router.refresh();
      }
    });

  return (
    <div className="space-y-5">
      <p className="text-xs text-neutral-500">
        Page produit façon Stan.store :{" "}
        <a href={previewUrl} target="_blank" className="font-semibold text-[#6967fb] hover:underline">
          {previewUrl}
        </a>
      </p>

      {/* SECTION ORDER (drag & drop) */}
      <Section title="Ordre des sections (glisse pour réorganiser)">
        <p className="text-xs text-neutral-500">
          Le bloc « Finalise ta commande » reste toujours en bas.
        </p>
        <div className="space-y-2">
          {c.sectionOrder.map((key, i) => (
            <div
              key={key}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) moveSection(dragIndex, i);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 cursor-move select-none ${
                dragIndex === i ? "border-[#6967fb] opacity-60" : "border-neutral-200"
              }`}
            >
              <GripVertical className="h-4 w-4 shrink-0 text-neutral-400" />
              <span className="text-xs font-bold text-neutral-400">{i + 1}.</span>
              <span className="text-sm font-medium text-neutral-800">
                {CORAN_SECTION_LABELS[key]}
              </span>
              <span className="ml-auto flex gap-1">
                <button
                  type="button"
                  onClick={() => moveSection(i, i - 1)}
                  disabled={i === 0}
                  className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                  aria-label="Monter"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(i, i + 1)}
                  disabled={i === c.sectionOrder.length - 1}
                  className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                  aria-label="Descendre"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </span>
            </div>
          ))}
        </div>
      </Section>

      {showDriveLink && (
        <Section title="Livraison — lien Google Drive (envoyé par email)">
          <p className="text-xs text-neutral-500">
            À l&apos;achat (carte ou Orange Money validé), l&apos;acheteur reçoit
            automatiquement un email avec CE lien. Aucun compte ni accès premium.
          </p>
          <input
            value={c.driveLink ?? ""}
            onChange={(e) => setC({ ...c, driveLink: e.target.value })}
            placeholder="https://drive.google.com/drive/folders/…"
            className={inputCls}
          />
        </Section>
      )}

      {/* BANNERS */}
      <Section title="Bannières (haut de page)">
        <div className="space-y-2">
          {c.banners.map((src, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-12 w-20 shrink-0 rounded-lg border border-neutral-200 object-cover" />
              <input
                value={src}
                onChange={(e) => setC({ ...c, banners: c.banners.map((b, idx) => (idx === i ? e.target.value : b)) })}
                className={inputCls}
              />
              <button type="button" onClick={() => setC({ ...c, banners: c.banners.filter((_, idx) => idx !== i) })} className="shrink-0 text-rose-500 hover:text-rose-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-4">
            <ImageUploadButton onUploaded={(url) => setC({ ...c, banners: [...c.banners, url] })} />
            <button type="button" onClick={() => setC({ ...c, banners: [...c.banners, ""] })} className="text-xs font-semibold text-[#6967fb]">
              + Ajouter une URL
            </button>
          </div>
        </div>
      </Section>

      {/* PDF PREVIEWS (samples) */}
      <Section title="Aperçus PDF (cover cliquable → extrait)">
        <p className="text-xs text-neutral-500">
          Chaque aperçu = une <strong>image de couverture</strong> (cliquable sur /coran)
          + un <strong>PDF d&apos;extrait</strong>. Ajoute-en autant que tu veux.
        </p>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-neutral-600">Titre de la section</span>
          <input
            value={c.samplesHeading}
            onChange={(e) => setC({ ...c, samplesHeading: e.target.value })}
            className={inputCls}
          />
        </label>
        {c.samples.map((s, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-600">Aperçu {i + 1}</span>
              <button type="button" onClick={() => rmSample(i)} className="text-rose-500 hover:text-rose-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-start gap-3">
              {s.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.cover} alt="" className="h-16 w-12 shrink-0 rounded border border-neutral-200 object-cover" />
              )}
              <div className="flex-1 space-y-1">
                <input value={s.cover} onChange={(e) => setSample(i, { cover: e.target.value })} placeholder="URL de la couverture" className={inputCls} />
                <FileUploadButton accept="image/*" label="📷 Couverture depuis mon PC" onUploaded={(url) => setSample(i, { cover: url })} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input value={s.pdf} onChange={(e) => setSample(i, { pdf: e.target.value })} placeholder="URL du PDF (extrait)" className={inputCls} />
                {s.pdf && (
                  <a href={s.pdf} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-semibold text-[#6967fb] underline">
                    voir
                  </a>
                )}
              </div>
              <FileUploadButton accept="application/pdf" label="📄 PDF extrait depuis mon PC" onUploaded={(url) => setSample(i, { pdf: url })} />
            </div>
            <input value={s.title} onChange={(e) => setSample(i, { title: e.target.value })} placeholder="Titre (optionnel)" className={inputCls} />
          </div>
        ))}
        <button type="button" onClick={addSample} className="text-xs font-semibold text-[#6967fb]">
          + Ajouter un aperçu
        </button>
      </Section>

      {/* GIFS */}
      <Section title="GIFs (optionnel)">
        <div className="space-y-2">
          {c.gifs.map((src, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-12 w-20 shrink-0 rounded-lg border border-neutral-200 object-cover" />
              <input
                value={src}
                onChange={(e) => setC({ ...c, gifs: c.gifs.map((g, idx) => (idx === i ? e.target.value : g)) })}
                className={inputCls}
              />
              <button type="button" onClick={() => setC({ ...c, gifs: c.gifs.filter((_, idx) => idx !== i) })} className="shrink-0 text-rose-500 hover:text-rose-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <FileUploadButton accept="image/gif,image/*" label="Téléverser un GIF" onUploaded={(url) => setC({ ...c, gifs: [...c.gifs, url] })} />
        </div>
      </Section>

      {/* COLORS */}
      <Section title="Couleurs de la page">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Fond de page</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={c.bgColor}
                onChange={(e) => setC({ ...c, bgColor: e.target.value })}
                className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-neutral-300"
              />
              <input value={c.bgColor} onChange={(e) => setC({ ...c, bgColor: e.target.value })} className={inputCls} />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Couleur du texte</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={c.textColor}
                onChange={(e) => setC({ ...c, textColor: e.target.value })}
                className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-neutral-300"
              />
              <input value={c.textColor} onChange={(e) => setC({ ...c, textColor: e.target.value })} className={inputCls} />
            </div>
          </label>
        </div>
      </Section>

      {/* TITLE + PRICE */}
      <Section title="Titre & prix">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-neutral-600">Titre</span>
          <input value={c.title} onChange={(e) => setC({ ...c, title: e.target.value })} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-neutral-600">Sous-titre</span>
          <textarea rows={2} value={c.subtitle} onChange={(e) => setC({ ...c, subtitle: e.target.value })} className={inputCls} />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Devise</span>
            <select
              value={c.price.currency}
              onChange={(e) => setC({ ...c, price: { ...c.price, currency: e.target.value as any } })}
              className={inputCls}
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Prix</span>
            <input value={euros(c.price.amountCents)} onChange={(e) => setC({ ...c, price: { ...c.price, amountCents: toCents(e.target.value) } })} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Prix barré</span>
            <input value={euros(c.price.compareAtCents)} onChange={(e) => setC({ ...c, price: { ...c.price, compareAtCents: toCents(e.target.value) } })} className={inputCls} />
          </label>
        </div>
        <label className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
          <span className="text-xs font-semibold text-neutral-600">Afficher le prix</span>
          <input type="checkbox" checked={c.showPrice} onChange={(e) => setC({ ...c, showPrice: e.target.checked })} />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
          <span className="text-xs font-semibold text-neutral-600">
            Afficher aussi le prix en FCFA
          </span>
          <input type="checkbox" checked={c.showFcfa} onChange={(e) => setC({ ...c, showFcfa: e.target.checked })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-neutral-600">
            Prix en FCFA (laisse 0 = conversion auto depuis l&apos;euro)
          </span>
          <input
            inputMode="numeric"
            value={c.fcfaAmount || ""}
            onChange={(e) =>
              setC({ ...c, fcfaAmount: parseInt(e.target.value.replace(/[^\d]/g, ""), 10) || 0 })
            }
            placeholder="Ex. 5000"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-neutral-600">Texte du bouton (CTA / sticky)</span>
          <input value={c.ctaLabel} onChange={(e) => setC({ ...c, ctaLabel: e.target.value })} className={inputCls} />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
          <span className="text-xs font-semibold text-neutral-600">
            Afficher la barre de paiement flottante (sticky)
          </span>
          <input type="checkbox" checked={c.showStickyBar} onChange={(e) => setC({ ...c, showStickyBar: e.target.checked })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-neutral-600">
            Texte d&apos;accroche de la barre sticky
          </span>
          <input
            value={c.stickyBarText}
            onChange={(e) => setC({ ...c, stickyBarText: e.target.value })}
            placeholder="Ex. Offre limitée · Accès à vie · Sans abonnement"
            className={inputCls}
          />
        </label>
      </Section>

      {/* DELIVERABLES */}
      <Section title="Ce que le client reçoit (case « Finalise ta commande »)">
        <label className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
          <span className="text-xs font-semibold text-neutral-600">Afficher cette liste</span>
          <input
            type="checkbox"
            checked={c.showDeliverables}
            onChange={(e) => setC({ ...c, showDeliverables: e.target.checked })}
          />
        </label>
        <div className="space-y-2">
          {c.deliverables.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) =>
                  setC({ ...c, deliverables: c.deliverables.map((x, idx) => (idx === i ? e.target.value : x)) })
                }
                placeholder="Ex. Accès Premium à vie à l'application"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setC({ ...c, deliverables: c.deliverables.filter((_, idx) => idx !== i) })}
                className="shrink-0 text-rose-500 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setC({ ...c, deliverables: [...c.deliverables, ""] })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#6967fb]"
          >
            <Plus className="h-3.5 w-3.5" /> Ajouter un élément
          </button>
        </div>
      </Section>

      {/* ORANGE MONEY (manual) */}
      <Section title="Paiement Orange Money (manuel)">
        <p className="text-xs text-neutral-500">
          Le client envoie l&apos;argent sur ton numéro, puis colle l&apos;ID de transaction.
          Tu valides ensuite chaque commande dans l&apos;onglet « Commandes Orange Money ».
        </p>
        <label className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2.5">
          <span className="text-xs font-semibold text-neutral-600">
            Activer le paiement Orange Money sur /coran
          </span>
          <input
            type="checkbox"
            checked={c.orangeMoney.enabled}
            onChange={(e) => setC({ ...c, orangeMoney: { ...c.orangeMoney, enabled: e.target.checked } })}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Numéro Orange Money</span>
            <input
              value={c.orangeMoney.number}
              onChange={(e) => setC({ ...c, orangeMoney: { ...c.orangeMoney, number: e.target.value } })}
              placeholder="+221 77 123 45 67"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-neutral-600">Montant à envoyer</span>
            <input
              value={c.orangeMoney.amountLabel}
              onChange={(e) => setC({ ...c, orangeMoney: { ...c.orangeMoney, amountLabel: e.target.value } })}
              placeholder="5 000 FCFA"
              className={inputCls}
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-neutral-600">Instructions (affichées au client)</span>
          <textarea
            rows={4}
            value={c.orangeMoney.instructions}
            onChange={(e) => setC({ ...c, orangeMoney: { ...c.orangeMoney, instructions: e.target.value } })}
            className={inputCls}
          />
        </label>
      </Section>

      {/* BODY BLOCKS */}
      <Section title="Corps de page (texte & images, dans l'ordre)">
        <div className="space-y-3">
          {c.body.map((block, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-neutral-400">
                  {block.type === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : <Type className="h-3.5 w-3.5" />}
                  {block.type === "image" ? "Image" : "Texte"} · {i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveBlock(i, -1)} className="rounded p-1 text-neutral-400 hover:bg-neutral-100"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" onClick={() => moveBlock(i, 1)} className="rounded p-1 text-neutral-400 hover:bg-neutral-100"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => rmBlock(i)} className="rounded p-1 text-rose-400 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {block.type === "image" ? (
                <div className="flex items-center gap-3">
                  {block.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={block.url} alt="" className="h-16 w-24 shrink-0 rounded-lg border border-neutral-200 object-cover" />
                  ) : (
                    <div className="h-16 w-24 shrink-0 rounded-lg border border-dashed border-neutral-300" />
                  )}
                  <div className="flex-1 space-y-1">
                    <input value={block.url} onChange={(e) => setBlock(i, { type: "image", url: e.target.value })} placeholder="URL de l'image" className={inputCls} />
                    <ImageUploadButton onUploaded={(url) => setBlock(i, { type: "image", url })} />
                  </div>
                </div>
              ) : (
                <textarea
                  rows={4}
                  value={block.text}
                  onChange={(e) => setBlock(i, { type: "text", text: e.target.value })}
                  placeholder="Ton texte… (les sauts de ligne sont conservés)"
                  className={inputCls}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setC({ ...c, body: [...c.body, { type: "text", text: "" }] })} className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white">
            <Plus className="h-3.5 w-3.5" /> Texte
          </button>
          <button type="button" onClick={() => setC({ ...c, body: [...c.body, { type: "image", url: "" }] })} className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white">
            <Plus className="h-3.5 w-3.5" /> Image
          </button>
        </div>
      </Section>

      {/* REVIEWS */}
      <Section title="Commentaires / avis">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-neutral-600">Titre de la section</span>
          <input value={c.reviewsHeading} onChange={(e) => setC({ ...c, reviewsHeading: e.target.value })} className={inputCls} />
        </label>

        <div>
          <span className="mb-1 block text-xs font-semibold text-neutral-600">
            Captures d&apos;avis (carrousel défilant, comme la landing V3)
          </span>
          {c.reviewImages.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {c.reviewImages.map((src, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-20 w-auto rounded-lg border border-neutral-200 object-contain" />
                  <button
                    type="button"
                    onClick={() => setC({ ...c, reviewImages: c.reviewImages.filter((_, idx) => idx !== i) })}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-rose-500 p-0.5 text-white shadow"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <ImageUploadButton onUploaded={(url) => setC({ ...c, reviewImages: [...c.reviewImages, url] })} />
        </div>
        {c.reviews.map((r, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 bg-white p-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-500">Avis {i + 1}</span>
              <button type="button" onClick={() => setC({ ...c, reviews: c.reviews.filter((_, idx) => idx !== i) })} className="text-neutral-400 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
            </div>
            <input value={r.name} onChange={(e) => setC({ ...c, reviews: c.reviews.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)) })} placeholder="Prénom" className={inputCls} />
            <textarea rows={2} value={r.text} onChange={(e) => setC({ ...c, reviews: c.reviews.map((x, idx) => (idx === i ? { ...x, text: e.target.value } : x)) })} placeholder="Commentaire" className={`${inputCls} mt-1.5`} />
          </div>
        ))}
        <button type="button" onClick={() => setC({ ...c, reviews: [...c.reviews, { name: "", text: "" }] })} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6967fb]">
          <Plus className="h-3.5 w-3.5" /> Ajouter un avis
        </button>
      </Section>

      <Section title="Rassurance (sous le paiement)">
        <input value={c.guarantee} onChange={(e) => setC({ ...c, guarantee: e.target.value })} className={inputCls} />
      </Section>

      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" disabled={pending} onClick={onSave}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {msg && (
          <span className={`text-sm font-medium ${msg.ok ? "text-brilliant-green" : "text-rose-500"}`}>{msg.text}</span>
        )}
      </div>
    </div>
  );
}
