"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updatePackContent } from "@/actions/pack-content";
import type { PackContent } from "@/lib/pack-shared";
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
  const signed = await createMediaUploadUrl(ext, "pack");
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
    <div className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-neutral-200 object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-[10px] text-neutral-400">aucune</div>
        )}
        <div className="flex flex-col gap-1">
          <label className="cursor-pointer text-xs font-semibold text-[#6967fb] hover:underline">
            {busy ? "Upload…" : "Téléverser"}
            <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return; setErr(null); setBusy(true);
              try { onChange(await uploadImage(f)); } catch (er: any) { setErr(er?.message || "Échec."); } finally { setBusy(false); e.target.value = ""; }
            }} />
          </label>
          {url && <button type="button" onClick={() => onChange("")} className="text-left text-xs text-neutral-400 hover:text-red-600">Retirer</button>}
          {err && <span className="text-xs text-rose-500">{err}</span>}
        </div>
      </div>
    </div>
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
      <AddBtn onClick={() => onChange([...items, ""])} />
    </div>
  );
}
function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400"><Plus className="h-3.5 w-3.5" /> Ajouter</button>
  );
}
function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-xs text-neutral-400 hover:text-red-600">Supprimer</button>
  );
}

/** Generic editor for an array of objects with string fields. */
function ObjList<T extends Record<string, string>>({
  label, items, onChange, fields, blank,
}: { label: string; items: T[]; onChange: (v: T[]) => void; fields: { key: keyof T & string; label: string; area?: boolean; image?: boolean }[]; blank: T }) {
  const upd = (i: number, k: keyof T, v: string) => onChange(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="space-y-3">
      <span className="block text-xs font-semibold text-neutral-600">{label}</span>
      {items.map((it, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
          {fields.map((f) =>
            f.image ? (
              <ImageField key={f.key} label={f.label} url={it[f.key]} onChange={(v) => upd(i, f.key, v)} />
            ) : f.area ? (
              <Area key={f.key} label={f.label} value={it[f.key]} onChange={(v) => upd(i, f.key, v)} rows={2} />
            ) : (
              <Text key={f.key} label={f.label} value={it[f.key]} onChange={(v) => upd(i, f.key, v)} />
            ),
          )}
          <DelBtn onClick={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddBtn onClick={() => onChange([...items, blank])} />
    </div>
  );
}

export function PackForm({ initial }: { initial: PackContent }) {
  const [c, setC] = useState<PackContent>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = (patch: Partial<PackContent>) => setC((p) => ({ ...p, ...patch }));

  const save = () =>
    start(async () => {
      setMsg(null);
      const res = await updatePackContent(c);
      if (res && "error" in res && res.error) setMsg({ ok: false, text: res.error });
      else { setMsg({ ok: true, text: "Enregistré ✓" }); router.refresh(); }
    });

  return (
    <div className="space-y-5">
      <a href="/pack-coran" target="_blank" className="text-xs font-semibold text-[#6967fb] hover:underline">Voir la page ↗</a>

      <Section title="Prix & bandeau">
        <div className="grid grid-cols-3 gap-3">
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Prix (centimes)</span>
            <input type="number" value={c.price.amountCents} onChange={(e) => set({ price: { ...c.price, amountCents: Number(e.target.value) } })} className={inputCls} /></label>
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Prix barré (centimes)</span>
            <input type="number" value={c.price.compareAtCents} onChange={(e) => set({ price: { ...c.price, compareAtCents: Number(e.target.value) } })} className={inputCls} /></label>
          <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Devise</span>
            <select value={c.price.currency} onChange={(e) => set({ price: { ...c.price, currency: e.target.value as any } })} className={inputCls}><option>EUR</option><option>USD</option><option>GBP</option></select></label>
        </div>
        <Text label="Bandeau haut (**gras** autorisé, vide = masqué)" value={c.topBar} onChange={(v) => set({ topBar: v })} />
        <label className="block"><span className="mb-1 block text-xs font-semibold text-neutral-600">Couleur d&apos;accent</span>
          <input type="color" value={c.accentColor} onChange={(e) => set({ accentColor: e.target.value })} className="h-10 w-24 rounded-lg border border-neutral-300" /></label>
      </Section>

      <Section title="Hero">
        <Text label="Étiquette" value={c.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Text label="Titre" value={c.heroTitle} onChange={(v) => set({ heroTitle: v })} />
        <Text label="Titre (partie en italique colorée)" value={c.heroTitleItalic} onChange={(v) => set({ heroTitleItalic: v })} />
        <Area label="Texte" value={c.heroText} onChange={(v) => set({ heroText: v })} />
        <Text label="Note sous le prix" value={c.priceNote} onChange={(v) => set({ priceNote: v })} />
        <Text label="Bouton principal" value={c.primaryCta} onChange={(v) => set({ primaryCta: v })} />
        <Text label="Texte sous le bouton" value={c.ctaSub} onChange={(v) => set({ ctaSub: v })} />
        <StringList label="Réassurance (3 items)" items={c.trust} onChange={(v) => set({ trust: v })} />
        <Text label="Note / avis (sous le livre)" value={c.ratingLabel} onChange={(v) => set({ ratingLabel: v })} />
        <ImageField label="Couverture du livre (sinon couverture générée)" url={c.coverImage} onChange={(v) => set({ coverImage: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Text label="Titre sur la couverture" value={c.coverTitle} onChange={(v) => set({ coverTitle: v })} />
          <Text label="Sous-titre couverture" value={c.coverSubtitle} onChange={(v) => set({ coverSubtitle: v })} />
        </div>
      </Section>

      <Section title="Douleur">
        <Text label="Titre" value={c.painTitle} onChange={(v) => set({ painTitle: v })} />
        <StringList label="Points" items={c.painItems} onChange={(v) => set({ painItems: v })} textarea />
        <Area label="Conclusion (encadré coloré)" value={c.painClose} onChange={(v) => set({ painClose: v })} />
      </Section>

      <Section title="Avant / Après">
        <Text label="Titre" value={c.transfoTitle} onChange={(v) => set({ transfoTitle: v })} />
        <ObjList label="Lignes" items={c.transfo} onChange={(v) => set({ transfo: v })} blank={{ before: "", after: "" }}
          fields={[{ key: "before", label: "Avant" }, { key: "after", label: "Après" }]} />
      </Section>

      <Section title="Ce que tu reçois (stack)">
        <Text label="Étiquette" value={c.stackLabel} onChange={(v) => set({ stackLabel: v })} />
        <Text label="Titre" value={c.stackTitle} onChange={(v) => set({ stackTitle: v })} />
        <Text label="Produit principal — titre" value={c.mainTitle} onChange={(v) => set({ mainTitle: v })} />
        <Area label="Produit principal — description" value={c.mainDesc} onChange={(v) => set({ mainDesc: v })} />
        <Text label="Produit principal — valeur" value={c.mainValue} onChange={(v) => set({ mainValue: v })} />
        <StringList label="Produit principal — points" items={c.mainBullets} onChange={(v) => set({ mainBullets: v })} />
        <ObjList label="Bonus (icône : calendar, book, audio, app, gift)" items={c.bonuses} onChange={(v) => set({ bonuses: v })}
          blank={{ title: "", desc: "", value: "", icon: "gift" }}
          fields={[{ key: "title", label: "Titre" }, { key: "desc", label: "Description", area: true }, { key: "value", label: "Valeur (ex : Valeur 19 €)" }, { key: "icon", label: "Icône" }]} />
        <div className="grid grid-cols-3 gap-3">
          <Text label="Libellé total" value={c.totalLabel} onChange={(v) => set({ totalLabel: v })} />
          <Text label="Valeur totale (barrée)" value={c.totalValue} onChange={(v) => set({ totalValue: v })} />
          <Text label="Libellé « aujourd'hui »" value={c.todayLabel} onChange={(v) => set({ todayLabel: v })} />
        </div>
      </Section>

      <Section title="Comment ça marche">
        <Text label="Titre" value={c.stepsTitle} onChange={(v) => set({ stepsTitle: v })} />
        <ObjList label="Étapes" items={c.steps} onChange={(v) => set({ steps: v })} blank={{ title: "", desc: "" }}
          fields={[{ key: "title", label: "Titre" }, { key: "desc", label: "Description", area: true }]} />
      </Section>

      <Section title="Aperçu des pages (masqué si vide)">
        <Text label="Titre" value={c.previewTitle} onChange={(v) => set({ previewTitle: v })} />
        <ObjList label="Pages" items={c.pages} onChange={(v) => set({ pages: v })} blank={{ image: "", caption: "" }}
          fields={[{ key: "image", label: "Image", image: true }, { key: "caption", label: "Légende" }]} />
      </Section>

      <Section title="Témoignages">
        <Text label="Titre" value={c.reviewsTitle} onChange={(v) => set({ reviewsTitle: v })} />
        <ObjList label="Avis" items={c.reviews} onChange={(v) => set({ reviews: v })} blank={{ name: "", meta: "", text: "", avatar: "" }}
          fields={[{ key: "name", label: "Prénom" }, { key: "meta", label: "Ville / contexte" }, { key: "text", label: "Témoignage", area: true }, { key: "avatar", label: "Photo (optionnelle)", image: true }]} />
      </Section>

      <Section title="Garantie & FAQ">
        <Text label="Titre garantie" value={c.guaranteeTitle} onChange={(v) => set({ guaranteeTitle: v })} />
        <Area label="Texte garantie" value={c.guaranteeText} onChange={(v) => set({ guaranteeText: v })} />
        <Text label="Titre FAQ" value={c.faqTitle} onChange={(v) => set({ faqTitle: v })} />
        <ObjList label="Questions" items={c.faq} onChange={(v) => set({ faq: v })} blank={{ q: "", a: "" }}
          fields={[{ key: "q", label: "Question" }, { key: "a", label: "Réponse", area: true }]} />
      </Section>

      <Section title="Paiement & barre sticky">
        <Text label="Titre du bloc paiement" value={c.checkoutTitle} onChange={(v) => set({ checkoutTitle: v })} />
        <StringList label="Points du bloc paiement" items={c.checkoutBullets} onChange={(v) => set({ checkoutBullets: v })} />
        <Text label="Petit texte sous le paiement" value={c.checkoutSmall} onChange={(v) => set({ checkoutSmall: v })} />
        <Text label="Texte barre sticky" value={c.stickyText} onChange={(v) => set({ stickyText: v })} />
        <Text label="Pied de page" value={c.footer} onChange={(v) => set({ footer: v })} />
      </Section>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button>
        {msg && <span className={`text-sm ${msg.ok ? "text-green-700" : "text-rose-600"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
