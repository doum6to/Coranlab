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
    variant: "classic" | "letter" | "product";
    pdfRaw: string;
    pricingByLocale: Record<Locale, PriceRow>;
    paymentBadges: string[];
  };
}) {
  const router = useRouter();
  const [priceEuros, setPriceEuros] = useState(initial.priceEuros);
  const [compareEuros, setCompareEuros] = useState(initial.compareEuros);
  const [spotsJoined, setSpotsJoined] = useState(String(initial.spotsJoined));
  const [spotsTotal, setSpotsTotal] = useState(String(initial.spotsTotal));
  const [variant, setVariant] = useState<"classic" | "letter" | "product">(
    initial.variant,
  );
  const [pdfRaw, setPdfRaw] = useState(initial.pdfRaw);
  const [pricing, setPricing] = useState<Record<Locale, PriceRow>>(
    initial.pricingByLocale,
  );
  const setPriceRow = (loc: Locale, patch: Partial<PriceRow>) =>
    setPricing((p) => ({ ...p, [loc]: { ...p[loc], ...patch } }));
  const [badges, setBadges] = useState<string[]>(initial.paymentBadges);
  const toggleBadge = (id: string) =>
    setBadges((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));
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

      const res = await updateOfferSettings({
        priceCents,
        compareAtCents,
        spotsJoined: joined,
        spotsTotal: total,
        variant,
        pdfLinks,
        pricingByLocale,
        paymentBadges: badges,
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

      <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Version de la landing en ligne
        </span>
        <div className="flex flex-wrap gap-2">
          {([
            ["classic", "Classique (V1)"],
            ["letter", "Lettre (V2)"],
            ["product", "Produit (V3)"],
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
