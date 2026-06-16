"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateCoranLandingContent } from "@/actions/coran-landing-content";
import type { CoranLandingContent, CoranBlock } from "@/lib/coran-landing-content";
import { compressImageFile } from "@/lib/images/compress-client";

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20";

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", await compressImageFile(file));
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const text = await res.text();
  let data: { url?: string; error?: string } = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text.slice(0, 140) || `Erreur ${res.status}` };
  }
  if (res.status === 413) throw new Error("Image trop lourde (> ~4,5 Mo).");
  if (!res.ok || !data.url) throw new Error(data.error || `Erreur ${res.status}`);
  return data.url;
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <h3 className="mb-3 text-sm font-bold text-neutral-800">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function CoranLandingForm({ initial }: { initial: CoranLandingContent }) {
  const router = useRouter();
  const [c, setC] = useState<CoranLandingContent>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

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

  const onSave = () =>
    startTransition(async () => {
      setMsg(null);
      const res = await updateCoranLandingContent(c);
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
        <a href="/coran" target="_blank" className="font-semibold text-[#6967fb] hover:underline">
          /coran
        </a>
      </p>

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
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-neutral-600">Texte du bouton (CTA / sticky)</span>
          <input value={c.ctaLabel} onChange={(e) => setC({ ...c, ctaLabel: e.target.value })} className={inputCls} />
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
