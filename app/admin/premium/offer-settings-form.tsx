"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { updateOfferSettings } from "@/actions/offer-settings";

export function OfferSettingsForm({
  initial,
}: {
  initial: {
    priceEuros: string;
    compareEuros: string;
    spotsJoined: number;
    spotsTotal: number;
  };
}) {
  const router = useRouter();
  const [priceEuros, setPriceEuros] = useState(initial.priceEuros);
  const [compareEuros, setCompareEuros] = useState(initial.compareEuros);
  const [spotsJoined, setSpotsJoined] = useState(String(initial.spotsJoined));
  const [spotsTotal, setSpotsTotal] = useState(String(initial.spotsTotal));
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
      const res = await updateOfferSettings({
        priceCents,
        compareAtCents,
        spotsJoined: joined,
        spotsTotal: total,
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
