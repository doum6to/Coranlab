"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateTikTokLandingContent } from "@/actions/tiktok-landing-content";
import type {
  TikTokLandingContent,
  StoryBubble,
} from "@/lib/tiktok-landing-content";

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20";

function Field({
  label,
  value,
  onChange,
  hint,
  textarea,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>
      {textarea ? (
        <textarea rows={rows ?? 3} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
      {hint && <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span>}
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
      <span className="mb-1 block text-xs font-semibold text-neutral-600">{label}</span>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-neutral-200 object-contain" />
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <h3 className="mb-3 text-sm font-bold text-neutral-800">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function TikTokLandingForm({ initial }: { initial: TikTokLandingContent }) {
  const router = useRouter();
  const [c, setC] = useState<TikTokLandingContent>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const patch = (updater: (c: TikTokLandingContent) => TikTokLandingContent) =>
    setC(updater);

  const setHero = (k: keyof TikTokLandingContent["hero"], v: string) =>
    patch((c) => ({ ...c, hero: { ...c.hero, [k]: v } }));
  const setBook = (k: keyof TikTokLandingContent["book"], v: string | string[]) =>
    patch((c) => ({ ...c, book: { ...c.book, [k]: v } }));
  const setOfferCard = (k: keyof TikTokLandingContent["offerCard"], v: string | string[]) =>
    patch((c) => ({ ...c, offerCard: { ...c.offerCard, [k]: v } }));
  const setFinal = (k: keyof TikTokLandingContent["finalCta"], v: string) =>
    patch((c) => ({ ...c, finalCta: { ...c.finalCta, [k]: v } }));

  // Story bubbles
  const setBubble = (i: number, p: Partial<StoryBubble>) =>
    patch((c) => ({
      ...c,
      story: {
        ...c.story,
        bubbles: c.story.bubbles.map((b, idx) => (idx === i ? { ...b, ...p } : b)),
      },
    }));
  const addBubble = () =>
    patch((c) => ({
      ...c,
      story: { ...c.story, bubbles: [...c.story.bubbles, { side: "left", text: "" }] },
    }));
  const rmBubble = (i: number) =>
    patch((c) => ({
      ...c,
      story: { ...c.story, bubbles: c.story.bubbles.filter((_, idx) => idx !== i) },
    }));

  // Method cards
  const setCard = (i: number, p: Partial<{ title: string; text: string }>) =>
    patch((c) => ({
      ...c,
      method: {
        ...c.method,
        cards: c.method.cards.map((m, idx) => (idx === i ? { ...m, ...p } : m)),
      },
    }));
  const addCard = () =>
    patch((c) => ({
      ...c,
      method: { ...c.method, cards: [...c.method.cards, { title: "", text: "" }] },
    }));
  const rmCard = (i: number) =>
    patch((c) => ({
      ...c,
      method: { ...c.method, cards: c.method.cards.filter((_, idx) => idx !== i) },
    }));

  // FAQ items
  const setFaqItem = (i: number, p: Partial<{ q: string; a: string }>) =>
    patch((c) => ({
      ...c,
      faq: {
        ...c.faq,
        items: c.faq.items.map((it, idx) => (idx === i ? { ...it, ...p } : it)),
      },
    }));
  const addFaq = () =>
    patch((c) => ({ ...c, faq: { ...c.faq, items: [...c.faq.items, { q: "", a: "" }] } }));
  const rmFaq = (i: number) =>
    patch((c) => ({
      ...c,
      faq: { ...c.faq, items: c.faq.items.filter((_, idx) => idx !== i) },
    }));

  const onSave = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await updateTikTokLandingContent(c);
      if (res?.error) setMsg({ ok: false, text: res.error });
      else {
        setMsg({ ok: true, text: "Enregistré ✓" });
        router.refresh();
      }
    });
  };

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-neutral-800">
          Landing TikTok — /comprendre-le-coran
        </h2>
        <p className="text-sm text-neutral-500">
          Page story qui prolonge la pub TikTok (le couple). Le prix se règle
          dans l&apos;onglet « Offre &amp; prix » (Prix Landing TikTok). Les avis
          sont repris automatiquement de la landing Produit V3.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="1. Hero (haut de page)">
          <Field label="Accroche (douleur)" value={c.hero.eyebrow} onChange={(v) => setHero("eyebrow", v)} />
          <Field label="Titre (début)" value={c.hero.title} onChange={(v) => setHero("title", v)} />
          <Field label="Titre (partie violette)" value={c.hero.titleHighlight} onChange={(v) => setHero("titleHighlight", v)} />
          <Field label="Sous-titre" value={c.hero.subtitle} onChange={(v) => setHero("subtitle", v)} textarea />
          <ImageField label="Illustration (ex. le couple de la pub)" value={c.hero.image} onChange={(v) => setHero("image", v)} />
          <Field label="Bouton" value={c.hero.cta} onChange={(v) => setHero("cta", v)} />
          <Field label="Sous-texte du bouton" value={c.hero.ctaSub} onChange={(v) => setHero("ctaSub", v)} />
          <Field label="Preuve sociale (sous les étoiles)" value={c.hero.socialProof} onChange={(v) => setHero("socialProof", v)} />
        </Section>

        <Section title="2. Conversation (reprend la pub)">
          <Field label="Titre de section" value={c.story.heading} onChange={(v) => patch((cc) => ({ ...cc, story: { ...cc.story, heading: v } }))} />
          {c.story.bubbles.map((b, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 bg-white p-2">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {(["left", "right"] as const).map((side) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setBubble(i, { side })}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        b.side === side
                          ? "bg-[#6967fb] text-white"
                          : "border border-neutral-200 bg-white text-neutral-500"
                      }`}
                    >
                      {side === "left" ? "Lui" : "Elle"}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => rmBubble(i)} className="text-neutral-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                rows={2}
                className={inputCls}
                value={b.text}
                onChange={(e) => setBubble(i, { text: e.target.value })}
                placeholder="Réplique…"
              />
            </div>
          ))}
          <button type="button" onClick={addBubble} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6967fb]">
            <Plus className="h-3.5 w-3.5" /> Ajouter une réplique
          </button>
        </Section>

        <Section title="3. Méthode (pourquoi 500 mots)">
          <Field label="Titre de section" value={c.method.heading} onChange={(v) => patch((cc) => ({ ...cc, method: { ...cc.method, heading: v } }))} />
          {c.method.cards.map((card, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 bg-white p-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-500">Carte {i + 1}</span>
                <button type="button" onClick={() => rmCard(i)} className="text-neutral-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input className={inputCls} value={card.title} onChange={(e) => setCard(i, { title: e.target.value })} placeholder="Titre" />
              <textarea rows={2} className={`${inputCls} mt-1.5`} value={card.text} onChange={(e) => setCard(i, { text: e.target.value })} placeholder="Texte" />
            </div>
          ))}
          <button type="button" onClick={addCard} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6967fb]">
            <Plus className="h-3.5 w-3.5" /> Ajouter une carte
          </button>
        </Section>

        <Section title="4. Le livre + bonus">
          <Field label="Titre" value={c.book.heading} onChange={(v) => setBook("heading", v)} />
          <Field label="Texte" value={c.book.text} onChange={(v) => setBook("text", v)} textarea />
          <ImageField label="Image du livre (mockup)" value={c.book.image} onChange={(v) => setBook("image", v)} />
          <Field
            label="Points clés (un par ligne)"
            value={c.book.bullets.join("\n")}
            onChange={(v) => setBook("bullets", v.split("\n"))}
            rows={4}
            textarea
          />
          <Field label="Titre des bonus" value={c.book.bonusHeading} onChange={(v) => setBook("bonusHeading", v)} />
          <Field
            label="Bonus (un par ligne)"
            value={c.book.bonuses.join("\n")}
            onChange={(v) => setBook("bonuses", v.split("\n"))}
            rows={3}
            textarea
          />
        </Section>

        <Section title="5. Carte offre (prix)">
          <Field label="Accroche" value={c.offerCard.eyebrow} onChange={(v) => setOfferCard("eyebrow", v)} />
          <Field label="Mention après le prix" value={c.offerCard.priceSuffix} onChange={(v) => setOfferCard("priceSuffix", v)} />
          <Field
            label="Ce qui est inclus (un par ligne)"
            value={c.offerCard.features.join("\n")}
            onChange={(v) => setOfferCard("features", v.split("\n"))}
            rows={4}
            textarea
          />
          <Field label="Bouton" value={c.offerCard.cta} onChange={(v) => setOfferCard("cta", v)} />
          <Field label="Sous-texte du bouton" value={c.offerCard.ctaSub} onChange={(v) => setOfferCard("ctaSub", v)} />
          <Field label="Garantie / sécurité" value={c.offerCard.guarantee} onChange={(v) => setOfferCard("guarantee", v)} />
        </Section>

        <Section title="6. FAQ + CTA final">
          <Field label="Titre FAQ" value={c.faq.heading} onChange={(v) => patch((cc) => ({ ...cc, faq: { ...cc.faq, heading: v } }))} />
          {c.faq.items.map((it, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 bg-white p-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-500">Question {i + 1}</span>
                <button type="button" onClick={() => rmFaq(i)} className="text-neutral-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input className={inputCls} value={it.q} onChange={(e) => setFaqItem(i, { q: e.target.value })} placeholder="Question" />
              <textarea rows={2} className={`${inputCls} mt-1.5`} value={it.a} onChange={(e) => setFaqItem(i, { a: e.target.value })} placeholder="Réponse" />
            </div>
          ))}
          <button type="button" onClick={addFaq} className="inline-flex items-center gap-1 text-xs font-semibold text-[#6967fb]">
            <Plus className="h-3.5 w-3.5" /> Ajouter une question
          </button>
          <Field label="Titre CTA final" value={c.finalCta.title} onChange={(v) => setFinal("title", v)} />
          <Field label="Sous-titre CTA final" value={c.finalCta.subtitle} onChange={(v) => setFinal("subtitle", v)} />
          <Field label="Bouton final" value={c.finalCta.cta} onChange={(v) => setFinal("cta", v)} />
        </Section>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" size="sm" disabled={pending} onClick={onSave}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {msg && (
          <span className={`text-sm font-medium ${msg.ok ? "text-brilliant-green" : "text-rose-500"}`}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
