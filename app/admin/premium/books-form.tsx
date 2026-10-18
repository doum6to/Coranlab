"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateBooksContent } from "@/actions/books-content";
import type { Book, BooksContent } from "@/lib/books-shared";
import { compressImageFile } from "@/lib/images/compress-client";
import { createMediaUploadUrl } from "@/actions/landing-media";
import { createClient } from "@/lib/supabase/client";

const MAX = 50 * 1024 * 1024;
const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900";

async function uploadImage(file: File): Promise<string> {
  let f = file;
  const raster = file.type.startsWith("image/") && file.type !== "image/gif" && file.type !== "image/svg+xml";
  if (raster) f = await compressImageFile(file, 1600, 0.85);
  if (f.size > MAX) throw new Error("Fichier trop lourd (max 50 Mo).");
  const ext = (f.name.split(".").pop() || "bin").toLowerCase();
  const signed = await createMediaUploadUrl(ext, "books");
  if ("error" in signed) throw new Error(signed.error);
  const { error } = await createClient()
    .storage.from(signed.bucket)
    .uploadToSignedUrl(signed.path, signed.token, f, { contentType: f.type || "application/octet-stream" });
  if (error) throw new Error(error.message);
  return signed.publicUrl;
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
function Cover({ url, onChange }: { url: string; onChange: (u: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-24 w-[72px] shrink-0 rounded-lg border border-neutral-200 object-cover" />
      ) : (
        <div className="flex h-24 w-[72px] shrink-0 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-[10px] text-neutral-400">générée</div>
      )}
      <div className="flex flex-col gap-1">
        <label className="cursor-pointer text-xs font-semibold text-[#6967fb] hover:underline">
          {busy ? "Upload…" : "Téléverser la couverture"}
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return; setErr(null); setBusy(true);
            try { onChange(await uploadImage(f)); } catch (er: any) { setErr(er?.message || "Échec."); } finally { setBusy(false); e.target.value = ""; }
          }} />
        </label>
        {url && <button type="button" onClick={() => onChange("")} className="text-left text-xs text-neutral-400 hover:text-red-600">Retirer</button>}
        {err && <span className="text-xs text-rose-500">{err}</span>}
      </div>
    </div>
  );
}

export function BooksForm({ initial }: { initial: BooksContent }) {
  const [c, setC] = useState<BooksContent>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = (patch: Partial<BooksContent>) => setC((p) => ({ ...p, ...patch }));
  const setBook = (slug: string, patch: Partial<Book>) => setC((p) => ({ ...p, books: p.books.map((b) => (b.slug === slug ? { ...b, ...patch } : b)) }));

  const save = () =>
    start(async () => {
      setMsg(null);
      const res = await updateBooksContent(c);
      if (res && "error" in res && res.error) setMsg({ ok: false, text: res.error });
      else { setMsg({ ok: true, text: "Enregistré ✓" }); router.refresh(); }
    });

  return (
    <div className="space-y-5">
      <a href="/boutique" target="_blank" className="text-xs font-semibold text-[#6967fb] hover:underline">Voir la boutique ↗</a>
      <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        Les PDF doivent être dans le bucket Supabase privé <code>books</code> sous les noms <code>85mots.pdf</code>, <code>dous.pdf</code> et <code>juzz.pdf</code>. Les achats iOS (RevenueCat <code>app.quranlab.book.&lt;slug&gt;</code>) sont reconnus sur le web.
      </p>

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="text-sm font-bold text-neutral-800">Textes de la boutique</h3>
        <div className="grid grid-cols-2 gap-3">
          <Text label="Titre" value={c.shopTitle} onChange={(shopTitle) => set({ shopTitle })} />
          <Text label="Sous-titre" value={c.shopSubtitle} onChange={(shopSubtitle) => set({ shopSubtitle })} />
          <Text label="Onglet boutique" value={c.tabShop} onChange={(tabShop) => set({ tabShop })} />
          <Text label="Onglet bibliothèque" value={c.tabLibrary} onChange={(tabLibrary) => set({ tabLibrary })} />
          <Text label="Libellé « inclus »" value={c.includedLabel} onChange={(includedLabel) => set({ includedLabel })} />
          <Text label="Libellé « possédé »" value={c.ownedLabel} onChange={(ownedLabel) => set({ ownedLabel })} />
          <Text label="Bouton acheter ({price})" value={c.buyLabel} onChange={(buyLabel) => set({ buyLabel })} />
          <Text label="Bouton lire" value={c.readLabel} onChange={(readLabel) => set({ readLabel })} />
          <Text label="Lien Premium" value={c.premiumLabel} onChange={(premiumLabel) => set({ premiumLabel })} />
          <Text label="Bibliothèque vide" value={c.emptyLibrary} onChange={(emptyLibrary) => set({ emptyLibrary })} />
        </div>
      </div>

      {c.books.map((b) => (
        <div key={b.slug} className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-sm font-bold text-neutral-800">{b.title} <span className="ml-2 rounded bg-neutral-200 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600">{b.slug}.pdf</span></h3>
          <Cover url={b.cover} onChange={(cover) => setBook(b.slug, { cover })} />
          <div className="grid grid-cols-2 gap-3">
            <Text label="Titre" value={b.title} onChange={(title) => setBook(b.slug, { title })} />
            <Text label="Sous-titre" value={b.subtitle} onChange={(subtitle) => setBook(b.slug, { subtitle })} />
          </div>
          <Area label="Description (boutique + upsell)" value={b.description} onChange={(description) => setBook(b.slug, { description })} rows={2} />
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-neutral-600">Points forts</span>
            {b.bullets.map((x, i) => (
              <div key={i} className="flex gap-2">
                <input value={x} onChange={(e) => setBook(b.slug, { bullets: b.bullets.map((y, j) => (j === i ? e.target.value : y)) })} className={inputCls} />
                <button type="button" onClick={() => setBook(b.slug, { bullets: b.bullets.filter((_, j) => j !== i) })} className="shrink-0 rounded-lg p-2 text-neutral-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setBook(b.slug, { bullets: [...b.bullets, ""] })} className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600"><Plus className="h-3.5 w-3.5" /> Ajouter</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Montant facturé (€)</span>
              <input type="number" step="0.01" min="0" value={(b.amountCents / 100).toString()} onChange={(e) => setBook(b.slug, { amountCents: Math.round((Number(e.target.value) || 0) * 100) })} className={inputCls} /></label>
            <Text label="Prix affiché" value={b.priceLabel} onChange={(priceLabel) => setBook(b.slug, { priceLabel })} />
            <Text label="Prix barré" value={b.compareLabel} onChange={(compareLabel) => setBook(b.slug, { compareLabel })} />
            <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Couleur</span>
              <input type="color" value={b.color} onChange={(e) => setBook(b.slug, { color: e.target.value })} className="h-10 w-full rounded-lg border border-neutral-300" /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Text label="Mention (format)" value={b.meta} onChange={(meta) => setBook(b.slug, { meta })} />
            <label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" checked={b.includedWithPremium} onChange={(e) => setBook(b.slug, { includedWithPremium: e.target.checked })} /> Inclus avec Premium (sinon vendu séparément)</label>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button>
        {msg && <span className={`text-sm ${msg.ok ? "text-green-700" : "text-rose-600"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
