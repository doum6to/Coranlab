"use client";

import { useState } from "react";

import type { CoranOrangeMoney } from "@/lib/coran-landing-content";
import { PaymentBadges } from "../offre-a-vie/payment-badges";
import { CoranCheckoutEmbed } from "./checkout-embed";
import { OrangeMoneyForm } from "./orange-money-pay";

type Method = "card" | "om";

/** Orange Money brand chip, matching the PaymentBadges chip style. */
function OmChip() {
  return (
    <span className="inline-flex h-7 items-center justify-center gap-1 rounded-md border border-neutral-200 bg-white px-2 shadow-sm">
      <span className="grid h-4 w-4 place-items-center rounded bg-[#ff7900] text-[8px] font-black text-white">
        OM
      </span>
      <span className="text-[11px] font-bold text-neutral-700">Orange&nbsp;Money</span>
    </span>
  );
}

function OptionRow({
  active,
  onClick,
  title,
  badges,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  badges: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
        active
          ? "border-[#6967fb] bg-[#6967fb]/5 ring-1 ring-[#6967fb]"
          : "border-neutral-200 bg-white hover:border-neutral-300"
      }`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
          active ? "border-[#6967fb]" : "border-neutral-300"
        }`}
      >
        {active && <span className="h-2.5 w-2.5 rounded-full bg-[#6967fb]" />}
      </span>
      <span className="text-sm font-semibold text-neutral-900">{title}</span>
      <span className="ml-auto flex items-center gap-1.5">{badges}</span>
    </button>
  );
}

/**
 * Payment-method selector for the /coran checkout box: the buyer picks Card /
 * Apple Pay (Stripe) or Orange Money (manual), and only the chosen form shows.
 * The Stripe embed stays mounted (hidden via CSS) to avoid re-creating a
 * checkout session each time the buyer switches tabs.
 */
export function PaymentMethods({
  omEnabled,
  om,
}: {
  omEnabled: boolean;
  om: CoranOrangeMoney;
}) {
  const [method, setMethod] = useState<Method>("card");

  // No Orange Money configured → just the card checkout, no selector.
  if (!omEnabled) return <CoranCheckoutEmbed />;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <OptionRow
          active={method === "card"}
          onClick={() => setMethod("card")}
          title="Carte bancaire / Apple Pay"
          badges={<PaymentBadges badges={["card", "applePay"]} />}
        />
        <OptionRow
          active={method === "om"}
          onClick={() => setMethod("om")}
          title="Orange Money"
          badges={<OmChip />}
        />
      </div>

      {/* Stripe embed stays mounted; just hidden when OM is selected. */}
      <div className={method === "card" ? "" : "hidden"}>
        <CoranCheckoutEmbed />
      </div>
      {method === "om" && <OrangeMoneyForm om={om} />}
    </div>
  );
}
