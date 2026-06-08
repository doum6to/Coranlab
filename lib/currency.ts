/**
 * Currency primitives shared by server and client (no server-only imports, so
 * client components like the admin offer form can use them too).
 */
export const CURRENCIES = ["EUR", "GBP", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export function isCurrency(v: unknown): v is Currency {
  return typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);
}

const CURRENCY_FORMAT_LOCALE: Record<Currency, string> = {
  EUR: "fr-FR",
  GBP: "en-GB",
  USD: "en-US",
};

/**
 * Formats cents in the given currency with its symbol (€, £, $), dropping a
 * trailing .00. Used for the per-language landing price.
 */
export function formatMoney(cents: number, currency: Currency): string {
  const value = cents / 100;
  try {
    return new Intl.NumberFormat(CURRENCY_FORMAT_LOCALE[currency], {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${Number.isInteger(value) ? value : value.toFixed(2)} ${currency}`;
  }
}
