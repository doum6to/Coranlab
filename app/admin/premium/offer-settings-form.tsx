"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { updateOfferSettings } from "@/actions/offer-settings";
import { CURRENCIES, type Currency } from "@/lib/currency";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/locales";

type PriceRow = { currency: Currency; price: string; compare: string };

const BADGE_OPTIONS: { id: string; label: string }[] = [
  { id: "card", label: "Cartes (Visa/Mastercard)" },
  { id: "applePay", label: "Apple Pay" },
  { id: "paypal", label: "PayPal" },
  { id: "klarna", label: "Klarna" },
  { id: "link", label: "Link" },
];

export function OfferSettingsForm({
  initial,
}: {
  initial: {
    priceEuros: string;
    compareEuros: string;
    spotsJoined: number;
    spotsTotal: number;
    variant: "classic" | "letter" | "product" | "funnel";
    pdfRaw: string;
    pricingByLocale: Record<Locale, PriceRow>;
    pricingByLocaleV4: Record<Locale, PriceRow>;
    funnelPrice: PriceRow;
    paymentBadges: string[];
    scarcityMode: "spots" | "timer";
    stickyBar: boolean;
  };
}) {
  const router = useRouter();
  const [priceEuros, setPriceEuros] = useState(initial.priceEuros);
  const [compareEuros, setCompareEuros] = useState(initial.compareEuros);
  const [spotsJoined, setSpotsJoined] = useState(String(initial.spotsJoined));
  const [spotsTotal, setSpotsTotal] = useState(String(initial.spotsTotal));
  const [variant, setVariant] = useState<
    "classic" | "letter" | "product" | "funnel"
  >(
    initial.variant,
  );
  const [pdfRaw, setPdfRaw] = useState(initial.pdfRaw);
  const [pricing, setPricing] = useState<Record<Locale, PriceRow>>(
    initial.pricingByLocale,
  );
  const setPriceRow = (loc: Locale, patch: Partial<PriceRow>) =>
    setPricing((p) => ({ ...p, [loc]: { ...p[loc], ...patch } }));
  const [pricingV4, setPricingV4] = useState<Record<Locale, PriceRow>>(
    initial.pricingByLocaleV4,
  );
  const setPriceRowV4 = (loc: Locale, patch: Partial<PriceRow>) =>
    setPricingV4((p) => ({ ...p, [loc]: { ...p[loc], ...patch } }));
  const [funnel, setFunnel] = useState<PriceRow>(initial.funnelPrice);
  const setFunnelRow = (patch: Partial<PriceRow>) =>
    setFunnel((f) => ({ ...f, ...patch }));
  const [badges, setBadges] = useState<string[]>(initial.paymentBadges);
  const toggleBadge = (id: string) =>
    setBadges((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));
  const [scarcityMode, setScarcityMode] = useState<"spots" | "timer">(
    initial.scarcityMode,
  );
  const [stickyBar, setStickyBar] = useState<boolean>(initial.stickyBar);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const onSave = () => {
    setMsg(null);
    const priceCents = Math.round(
      parseFloat(priceEuros.replace(",", ".")) * 100,
    );
    const compareAtCents = Math.round(
      parseFloat(compareEuros.replace(",", ".")) * 100,
    );
    const joined = parseInt(spotsJoined, 10);
    const total = parseInt(spotsTotal, 10);

    if (
      !Number.isFinite(priceCents) ||
      priceCents < 0 ||
      !Number.isFinite(compareAtCents) ||
      compareAtCents < 0 ||
      !Number.isFinite(joined) ||
      !Number.isFinite(total) ||
      total < 1
    ) {
      setMsg({ ok: false, text: "Valeurs invalides." });
      return;
    }

    startTransition(async () => {
      const pdfLinks = pdfRaw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, ...rest] = line.split("|");
          const url = rest.join("|").trim();
          return url
            ? { label: label.trim() || "Document", url }
            : { label: "Document", url: label.trim() };
        })
        .filter((l) => l.url.startsWith("http"));

      const pricingByLocale = Object.fromEntries(
        LOCALES.map((loc) => {
          const row = pricing[loc];
          // Empty / invalid price falls back to the global price; empty
          // compare means "no strike-through" (0), so a blank field never
          // blocks saving.
          const pc = Math.round(parseFloat(row.price.replace(",", ".")) * 100);
          const cc = Math.round(parseFloat(row.compare.replace(",", ".")) * 100);
          return [
            loc,
            {
              currency: row.currency,
              priceCents: Number.isFinite(pc) && pc >= 0 ? pc : priceCents,
              compareAtCents: Number.isFinite(cc) && cc >= 0 ? cc : 0,
            },
          ];
        }),
      ) as Record<Locale, { currency: Currency; priceCents: number; compareAtCents: number }>;

      const pricingByLocaleV4 = Object.fromEntries(
        LOCALES.map((loc) => {
          const row = pricingV4[loc];
          const pc = Math.round(parseFloat(row.price.replace(",", ".")) * 100);
          const cc = Math.round(parseFloat(row.compare.replace(",", ".")) * 100);
          return [
            loc,
            {
              currency: row.currency,
              priceCents: Number.isFinite(pc) && pc >= 0 ? pc : priceCents,
              compareAtCents: Number.isFinite(cc) && cc >= 0 ? cc : 0,
            },
          ];
        }),
      ) as Record<Locale, { currency: Currency; priceCents: number; compareAtCents: number }>;

      const funnelPc = Math.round(parseFloat(funnel.price.replace(",", ".")) * 100);
      const funnelCc = Math.round(parseFloat(funnel.compare.replace(",", ".")) * 100);
      const funnelPrice = {
        currency: funnel.currency,
        priceCents: Number.isFinite(funnelPc) && funnelPc >= 0 ? funnelPc : priceCents,
        compareAtCents: Number.isFinite(funnelCc) && funnelCc >= 0 ? funnelCc : 0,
      };

      const res = await updateOfferSettings({
        priceCents,
        compareAtCents,
        spotsJoined: joined,
        spotsTotal: total,
        variant,
        pdfLinks,
        pricingByLocale,
        pricingByLocaleV4,
        funnelPrice,
        paymentBadges: badges,
        scarcityMode,
        stickyBar,
      });
      if (res?.error) {
        setMsg({ ok: false, text: res.error });
      } else {
        setMsg({ ok: true, text: "Enregistré ✓" });
        router.refresh();
      }
    });
  };

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-neutral-800">
          Offre « Accès à vie » (/offre-a-vie)
        </h2>
        <p className="text-sm text-neutral-500">
          Le prix est appliqué au prochain paiement Stripe. Les places
          alimentent la barre et la jauge de la landing page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Prix (€)
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={priceEuros}
            onChange={(e) => setPriceEuros(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Prix barré (€)
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={compareEuros}
            onChange={(e) => setCompareEuros(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Élèves inscrits
          </span>
          <input
            type="number"
            value={spotsJoined}
            onChange={(e) => setSpotsJoined(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Places totales
          </span>
          <input
            type="number"
            value={spotsTotal}
            onChange={(e) => setSpotsTotal(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
          />
        </label>
      </div>

      {/* Payment badges shown on the landing */}
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Badges de paiement (landing)
        </span>
        <p className="mb-3 text-xs text-neutral-400">
          Coche les badges à afficher sous le bouton d&apos;achat. (Active aussi
          le moyen de paiement dans Stripe pour qu&apos;il fonctionne réellement.)
        </p>
        <div className="flex flex-wrap gap-2">
          {BADGE_OPTIONS.map((b) => {
            const on = badges.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggleBadge(b.id)}
                aria-pressed={on}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  on
                    ? "bg-[#6967fb] text-white"
                    : "bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                {on ? "✓ " : ""}
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scarcity mode + sticky bar */}
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Urgence (landing produit)
        </span>
        <div className="space-y-3">
          <div>
            <span className="mb-1 block text-xs font-medium text-neutral-600">
              Élément sous le bouton
            </span>
            <div className="flex flex-wrap gap-2">
              {([
                ["spots", "Places limitées"],
                ["timer", "Compte à rebours 24h"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setScarcityMode(key)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    scarcityMode === key
                      ? "bg-[#6967fb] text-white"
                      : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
            <span className="text-sm font-semibold text-neutral-800">
              Barre collante rouge en bas (timer + prix + CTA)
            </span>
            <input
              type="checkbox"
              checked={stickyBar}
              onChange={(e) => setStickyBar(e.target.checked)}
              className="h-5 w-5 rounded border-neutral-300"
            />
          </label>
          <p className="text-xs text-neutral-400">
            Le texte de la barre (« L&apos;offre se termine bientôt ») et son CTA
            se modifient par langue dans l&apos;onglet « Landing /offre-a-vie »
            (section Offre).
          </p>
        </div>
      </div>

      {/* Per-language pricing + currency (product landing + Stripe) */}
      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Prix par langue (landing produit + Stripe)
        </span>
        <p className="mb-3 text-xs text-neutral-400">
          Le prix affiché sur /offre-a-vie, /en/offre-a-vie et /es/offre-a-vie,
          et le montant + la devise réellement débités au paiement Stripe.
        </p>
        <div className="space-y-2">
          {LOCALES.map((loc) => (
            <div
              key={loc}
              className="grid grid-cols-[64px_90px_1fr_1fr] items-center gap-2"
            >
              <span className="text-sm font-semibold text-neutral-700">
                {LOCALE_NAMES[loc]}
              </span>
              <select
                value={pricing[loc].currency}
                onChange={(e) =>
                  setPriceRow(loc, { currency: e.target.value as Currency })
                }
                className="rounded-xl border border-neutral-300 px-2 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
              >
                {CURRENCIES.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
              <input
                type="text"
                inputMode="decimal"
                value={pricing[loc].price}
                onChange={(e) => setPriceRow(loc, { price: e.target.value })}
                placeholder="Prix"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
              />
              <input
                type="text"
                inputMode="decimal"
                value={pricing[loc].compare}
                onChange={(e) => setPriceRow(loc, { compare: e.target.value })}
                placeholder="Prix barré"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Per-language pricing for the V4 A/B variant */}
      <div className="mt-4 rounded-xl border border-[#6967fb]/30 bg-[#6967fb]/5 p-3">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6967fb]">
          Prix par langue — Produit V4 (A/B)
        </span>
        <p className="mb-3 text-xs text-neutral-400">
          Le prix affiché et débité sur /offre-a-vie-v4 (+ /en, /es). Indépendant
          de V3 — change-le pour tester un autre prix.
        </p>
        <div className="space-y-2">
          {LOCALES.map((loc) => (
            <div
              key={loc}
              className="grid grid-cols-[64px_90px_1fr_1fr] items-center gap-2"
            >
              <span className="text-sm font-semibold text-neutral-700">
                {LOCALE_NAMES[loc]}
              </span>
              <select
                value={pricingV4[loc].currency}
                onChange={(e) =>
                  setPriceRowV4(loc, { currency: e.target.value as Currency })
                }
                className="rounded-xl border border-neutral-300 px-2 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
              >
                {CURRENCIES.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
              <input
                type="text"
                inputMode="decimal"
                value={pricingV4[loc].price}
                onChange={(e) => setPriceRowV4(loc, { price: e.target.value })}
                placeholder="Prix"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
              />
              <input
                type="text"
                inputMode="decimal"
                value={pricingV4[loc].compare}
                onChange={(e) => setPriceRowV4(loc, { compare: e.target.value })}
                placeholder="Prix barré"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Funnel (V5) single price */}
      <div className="mt-4 rounded-xl border border-[#58cc6a]/40 bg-[#58cc6a]/5 p-3">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#3fa34d]">
          Prix du Tunnel (V5)
        </span>
        <p className="mb-3 text-xs text-neutral-400">
          Le prix affiché et débité dans le tunnel /offre-a-vie (variante
          « Tunnel »). Indépendant des autres versions.
        </p>
        <div className="grid grid-cols-[90px_1fr_1fr] items-center gap-2">
          <select
            value={funnel.currency}
            onChange={(e) => setFunnelRow({ currency: e.target.value as Currency })}
            className="rounded-xl border border-neutral-300 px-2 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
          >
            {CURRENCIES.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
          <input
            type="text"
            inputMode="decimal"
            value={funnel.price}
            onChange={(e) => setFunnelRow({ price: e.target.value })}
            placeholder="Prix"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
          />
          <input
            type="text"
            inputMode="decimal"
            value={funnel.compare}
            onChange={(e) => setFunnelRow({ compare: e.target.value })}
            placeholder="Prix barré"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Version de la landing en ligne
        </span>
        <div className="flex flex-wrap gap-2">
          {([
            ["classic", "Classique (V1)"],
            ["letter", "Lettre (V2)"],
            ["product", "Produit (V3)"],
            ["funnel", "Tunnel (V5)"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setVariant(key)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                variant === key
                  ? "bg-[#6967fb] text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          L&apos;autre version reste éditable et réutilisable à tout moment.
        </p>
      </div>

      <div className="mt-4">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Liens PDF (espace acheteur) — un par ligne : Libellé | URL
        </span>
        <textarea
          rows={4}
          value={pdfRaw}
          onChange={(e) => setPdfRaw(e.target.value)}
          placeholder={"Ebook 85% du Coran | https://...\nDu'as coraniques | https://..."}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
        />
        <p className="mt-1 text-xs text-neutral-400">
          Ces liens apparaissent dans « Mes documents » de l&apos;espace des
          personnes ayant acheté.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" size="sm" disabled={pending} onClick={onSave}>
          {pending ? "Enregistrement…" : "Enregistrer"}
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
