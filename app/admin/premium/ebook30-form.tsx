"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateEbook30Content } from "@/actions/ebook30-content";
import type { Ebook30Content } from "@/lib/ebook30-shared";
import { compressImageFile } from "@/lib/images/compress-client";
import { createMediaUploadUrl } from "@/actions/landing-media";
import { createClient } from "@/lib/supabase/client";

const MAX = 50 * 1024 * 1024;
const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900";

async function uploadImage(file: File): Promise<string> {
  let f = file;
  const raster = file.type.startsWith("image/") && file.type !== "image/gif" && file.type !== "image/svg+xml";
  if (raster) f = await compressImageFile(file, 2000, 0.85);
  if (f.size > MAX) throw new Error("Fichier trop lourd (max 50 Mo).");
  const ext = (f.name.split(".").pop() || "bin").toLowerCase();
  const signed = await createMediaUploadUrl(ext, "ebook30");
  if ("error" in signed) throw new Error(signed.error);
  const { error } = await createClient()
    .storage.from(signed.bucket)
    .uploadToSignedUrl(signed.path, signed.token, f, { contentType: f.type || "application/octet-stream" });
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
function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
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
      <button type="button" onClick={() => onChange([...items, ""])} className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"><Plus className="h-3.5 w-3.5" /> Ajouter</button>
    </div>
  );
}

export function Ebook30Form({ initial }: { initial: Ebook30Content }) {
  const [c, setC] = useState<Ebook30Content>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = (patch: Partial<Ebook30Content>) => setC((p) => ({ ...p, ...patch }));

  const save = () =>
    start(async () => {
      setMsg(null);
      const res = await updateEbook30Content(c);
      if (res && "error" in res && res.error) setMsg({ ok: false, text: res.error });
      else { setMsg({ ok: true, text: "Enregistré ✓" }); router.refresh(); }
    });

  const movePage = (from: number, to: number) => {
    if (to < 0 || to >= c.pages.length) return;
    const pages = [...c.pages]; const [m] = pages.splice(from, 1); pages.splice(to, 0, m); set({ pages });
  };

  return (
    <div className="space-y-5">
      <a href="/coran-30-jours" target="_blank" className="text-xs font-semibold text-[#6967fb] hover:underline">Voir la page ↗</a>

      <Section title="Apparence & marque">
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Couleur d&apos;accent</span>
            <input type="color" value={c.accentColor} onChange={(e) => set({ accentColor: e.target.value })} className="h-10 w-full rounded-lg border border-neutral-300" /></label>
          <Text label="Marque" value={c.brand} onChange={(v) => set({ brand: v })} />
        </div>
        <Text label="Bouton nav" value={c.navCta} onChange={(v) => set({ navCta: v })} />
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-neutral-600">Liens nav (libellé · ancre)</span>
          {c.navLinks.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={l.label} placeholder="Libellé" onChange={(e) => set({ navLinks: c.navLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} className={inputCls} />
              <input value={l.anchor} placeholder="ancre" onChange={(e) => set({ navLinks: c.navLinks.map((x, j) => (j === i ? { ...x, anchor: e.target.value } : x)) })} className={inputCls} />
              <button type="button" onClick={() => set({ navLinks: c.navLinks.filter((_, j) => j !== i) })} className="shrink-0 rounded-lg p-2 text-neutral-400 hover:bg-neutral-200 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => set({ navLinks: [...c.navLinks, { label: "", anchor: "" }] })} className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"><Plus className="h-3.5 w-3.5" /> Ajouter</button>
        </div>
      </Section>

      <Section title="Hero">
        <Text label="Accroche (eyebrow)" value={c.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Text label="Titre (1re ligne)" value={c.heroTitle} onChange={(v) => set({ heroTitle: v })} />
          <Text label="Titre italique (2e ligne)" value={c.heroTitleItalic} onChange={(v) => set({ heroTitleItalic: v })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Devise</span>
            <select value={c.price.currency} onChange={(e) => set({ price: { ...c.price, currency: e.target.value as any } })} className={inputCls}>
              <option value="EUR">EUR (€)</option><option value="USD">USD ($)</option><option value="GBP">GBP (£)</option></select></label>
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Prix</span>
            <input type="number" step="0.01" min="0" value={(c.price.amountCents / 100).toString()} onChange={(e) => set({ price: { ...c.price, amountCents: Math.round((Number(e.target.value) || 0) * 100) } })} className={inputCls} /></label>
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Prix barré</span>
            <input type="number" step="0.01" min="0" value={(c.price.compareAtCents / 100).toString()} onChange={(e) => set({ price: { ...c.price, compareAtCents: Math.round((Number(e.target.value) || 0) * 100) } })} className={inputCls} /></label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Text label="Bouton principal" value={c.primaryCta} onChange={(v) => set({ primaryCta: v })} />
          <Text label="Bouton secondaire" value={c.secondaryCta} onChange={(v) => set({ secondaryCta: v })} />
        </div>
        <Area label="Texte hero" value={c.heroText} onChange={(v) => set({ heroText: v })} />
        <Text label="Petite ligne (formats)" value={c.heroSmall} onChange={(v) => set({ heroSmall: v })} />
        <ImageField label="Couverture du livre 3D (image)" url={c.coverImage} onChange={(coverImage) => set({ coverImage })} />
        <Area label="Titre couverture (si pas d'image)" value={c.coverTitle} onChange={(v) => set({ coverTitle: v })} rows={2} />
        <Text label="Sous-titre couverture" value={c.coverSubtitle} onChange={(v) => set({ coverSubtitle: v })} />
      </Section>

      <Section title="Bandeau (3 items)">
        <StringList label="Items du bandeau" items={c.bandItems} onChange={(bandItems) => set({ bandItems })} />
      </Section>

      <Section title="Section « Plus que réciter »">
        <Text label="Label" value={c.aboutLabel} onChange={(v) => set({ aboutLabel: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Text label="Titre" value={c.aboutTitle} onChange={(v) => set({ aboutTitle: v })} />
          <Text label="Titre italique" value={c.aboutTitleItalic} onChange={(v) => set({ aboutTitleItalic: v })} />
        </div>
        <StringList label="Paragraphes" items={c.aboutBody} onChange={(aboutBody) => set({ aboutBody })} textarea />
        <Text label="Lien (texte)" value={c.aboutLink} onChange={(v) => set({ aboutLink: v })} />
      </Section>

      <Section title="Section « Feuilleter » (extraits)">
        <Text label="Label" value={c.flipLabel} onChange={(v) => set({ flipLabel: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Text label="Titre" value={c.flipTitle} onChange={(v) => set({ flipTitle: v })} />
          <Text label="Titre italique" value={c.flipTitleItalic} onChange={(v) => set({ flipTitleItalic: v })} />
        </div>
        <Area label="Sous-texte" value={c.flipSubtext} onChange={(v) => set({ flipSubtext: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Text label="Label gauche" value={c.flipLeftLabel} onChange={(v) => set({ flipLeftLabel: v })} />
          <Text label="Label droite" value={c.flipRightLabel} onChange={(v) => set({ flipRightLabel: v })} />
        </div>
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-neutral-600">Pages d&apos;extrait (image + légende)</span>
          {c.pages.map((p, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700">Page {i + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => movePage(i, i - 1)} className="rounded p-1 text-neutral-400 hover:bg-neutral-100"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" onClick={() => movePage(i, i + 1)} className="rounded p-1 text-neutral-400 hover:bg-neutral-100"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => set({ pages: c.pages.filter((_, j) => j !== i) })} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <ImageField label="Image de la page" url={p.image} onChange={(url) => set({ pages: c.pages.map((x, j) => (j === i ? { ...x, image: url } : x)) })} />
              <input value={p.caption} placeholder="Légende" onChange={(e) => set({ pages: c.pages.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)) })} className={inputCls} />
            </div>
          ))}
          <button type="button" onClick={() => set({ pages: [...c.pages, { image: "", caption: "" }] })} className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"><Plus className="h-3.5 w-3.5" /> Ajouter une page</button>
        </div>
      </Section>

      <Section title="3 colonnes">
        {c.cols.map((col, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Colonne {i + 1}</span>
              <button type="button" onClick={() => set({ cols: c.cols.filter((_, j) => j !== i) })} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
            <input value={col.title} placeholder="Titre" onChange={(e) => set({ cols: c.cols.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} className={inputCls} />
            <textarea rows={2} value={col.body} placeholder="Texte" onChange={(e) => set({ cols: c.cols.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)) })} className={inputCls} />
          </div>
        ))}
        <button type="button" onClick={() => set({ cols: [...c.cols, { title: "", body: "" }] })} className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"><Plus className="h-3.5 w-3.5" /> Ajouter une colonne</button>
      </Section>

      <Section title="CTA final & checkout">
        <Text label="Label final" value={c.finalLabel} onChange={(v) => set({ finalLabel: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Text label="Titre final" value={c.finalTitle} onChange={(v) => set({ finalTitle: v })} />
          <Text label="Titre final italique" value={c.finalTitleItalic} onChange={(v) => set({ finalTitleItalic: v })} />
        </div>
        <Area label="Texte final" value={c.finalText} onChange={(v) => set({ finalText: v })} />
        <Text label="Bouton final" value={c.finalCta} onChange={(v) => set({ finalCta: v })} />
        <Text label="Petite ligne finale" value={c.finalSmall} onChange={(v) => set({ finalSmall: v })} />
        <Text label="Badge checkout" value={c.checkoutBadge} onChange={(v) => set({ checkoutBadge: v })} />
        <Text label="Garantie" value={c.guarantee} onChange={(v) => set({ guarantee: v })} />
      </Section>

      <Section title="Pied de page">
        <Text label="Tagline" value={c.footerTagline} onChange={(v) => set({ footerTagline: v })} />
        <Text label="Copyright" value={c.footerCopyright} onChange={(v) => set({ footerCopyright: v })} />
      </Section>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-neutral-200 bg-white/95 py-3 backdrop-blur">
        <Button onClick={save} disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button>
        {msg && <span className={`text-sm font-semibold ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
