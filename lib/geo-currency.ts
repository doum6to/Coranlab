/**
 * Country → currency for the lifetime paywall: the learner sees and pays the
 * SAME number (9.99) in their local currency. Only currencies where that
 * number is a sensible price are mapped; everyone else pays in euros.
 */
export const PAYWALL_CURRENCIES = ["EUR", "GBP", "USD", "CAD", "AUD", "NZD", "CHF", "SGD"] as const;
export type PaywallCurrency = (typeof PAYWALL_CURRENCIES)[number];

const BY_COUNTRY: Record<string, PaywallCurrency> = {
  GB: "GBP", IM: "GBP", JE: "GBP", GG: "GBP",
  US: "USD", PR: "USD", GU: "USD", VI: "USD", AS: "USD", MP: "USD", EC: "USD", SV: "USD", PA: "USD",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
  CH: "CHF", LI: "CHF",
  SG: "SGD",
};

export const isPaywallCurrency = (v: unknown): v is PaywallCurrency =>
  typeof v === "string" && (PAYWALL_CURRENCIES as readonly string[]).includes(v);

/** ISO-3166 alpha-2 country (e.g. from the `x-vercel-ip-country` header) → currency. */
export function currencyForCountry(country: string | null | undefined): PaywallCurrency {
  return BY_COUNTRY[(country || "").toUpperCase()] ?? "EUR";
}

const SYMBOL: Record<PaywallCurrency, { pre: string; post: string }> = {
  EUR: { pre: "€", post: " €" },
  GBP: { pre: "£", post: " £" },
  USD: { pre: "$", post: " $" },
  CAD: { pre: "CA$", post: " CA$" },
  AUD: { pre: "A$", post: " A$" },
  NZD: { pre: "NZ$", post: " NZ$" },
  CHF: { pre: "CHF ", post: " CHF" },
  SGD: { pre: "S$", post: " S$" },
};

/**
 * Formats a price in minor units. French/Spanish style puts the symbol after
 * with a comma ("9,99 £"); English puts it before ("£9.99"). Whole amounts
 * drop the decimals ("£49").
 */
export function formatPaywallPrice(cents: number, currency: PaywallCurrency, locale: "fr" | "en" | "es"): string {
  const whole = cents % 100 === 0;
  const n = whole ? String(cents / 100) : (cents / 100).toFixed(2);
  const sym = SYMBOL[currency];
  if (locale === "en") return `${sym.pre}${n}`;
  return `${n.replace(".", ",")}${sym.post}`;
}

/** Reads the first integer-ish amount out of an admin label like "49 €" → 4900 cents. */
export function centsFromLabel(label: string, fallback: number): number {
  const m = label.replace(",", ".").match(/\d+(?:\.\d+)?/);
  return m ? Math.round(parseFloat(m[0]) * 100) : fallback;
}
