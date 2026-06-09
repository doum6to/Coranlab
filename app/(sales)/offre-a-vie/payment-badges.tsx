/**
 * Small payment-method trust badges (Shopify-style) shown under the CTA.
 * Which badges appear is controlled from the admin (offer.paymentBadges).
 * Pure presentational chips — actual methods are offered by Stripe Checkout.
 */

function Chip({
  children,
  bg = "#ffffff",
  label,
}: {
  children: React.ReactNode;
  bg?: string;
  label: string;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="inline-flex h-7 min-w-[42px] items-center justify-center gap-1 rounded-md border border-neutral-200 px-2 shadow-sm"
      style={{ backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

const Visa = () => (
  <Chip label="Visa">
    <span className="font-sans text-[13px] font-extrabold italic tracking-tight text-[#1A1F71]">
      VISA
    </span>
  </Chip>
);

const Mastercard = () => (
  <Chip label="Mastercard">
    <svg width="26" height="16" viewBox="0 0 26 16" aria-hidden>
      <circle cx="10" cy="8" r="6.2" fill="#EB001B" />
      <circle cx="16" cy="8" r="6.2" fill="#F79E1B" />
      <path
        d="M13 3.1a6.2 6.2 0 0 0 0 9.8 6.2 6.2 0 0 0 0-9.8Z"
        fill="#FF5F00"
      />
    </svg>
  </Chip>
);

const ApplePay = () => (
  <Chip label="Apple Pay">
    <svg width="13" height="15" viewBox="0 0 16 20" fill="#000" aria-hidden>
      <path d="M11.2 3.1c.6-.7 1-1.7.9-2.7-.86.04-1.9.58-2.5 1.3-.55.62-1.04 1.64-.91 2.6.96.08 1.9-.49 2.51-1.2Z" />
      <path d="M12.1 5.3c-1.4-.08-2.59.79-3.26.79-.67 0-1.7-.75-2.8-.73-1.44.02-2.77.84-3.51 2.13-1.5 2.6-.38 6.45 1.07 8.56.71 1.03 1.56 2.19 2.67 2.15 1.07-.04 1.48-.69 2.77-.69 1.29 0 1.66.69 2.79.67 1.15-.02 1.88-1.05 2.59-2.09.81-1.2 1.14-2.36 1.16-2.42-.03-.01-2.23-.86-2.25-3.4-.02-2.13 1.74-3.15 1.82-3.2-.99-1.47-2.54-1.63-3.09-1.67Z" />
    </svg>
    <span className="font-sans text-[12px] font-semibold text-black">Pay</span>
  </Chip>
);

const PayPal = () => (
  <Chip label="PayPal">
    <span className="font-sans text-[12px] font-extrabold italic">
      <span className="text-[#003087]">Pay</span>
      <span className="text-[#009cde]">Pal</span>
    </span>
  </Chip>
);

const Klarna = () => (
  <Chip label="Klarna" bg="#FFB3C7">
    <span className="font-sans text-[12px] font-bold text-black">Klarna</span>
  </Chip>
);

const Link = () => (
  <Chip label="Link">
    <span className="inline-flex items-center gap-0.5">
      <span className="h-2.5 w-2.5 rounded-[3px] bg-[#33ddb3]" />
      <span className="font-sans text-[12px] font-bold lowercase text-[#1a1a1a]">
        link
      </span>
    </span>
  </Chip>
);

const RENDERERS: Record<string, () => JSX.Element> = {
  applePay: ApplePay,
  paypal: PayPal,
  klarna: Klarna,
  link: Link,
};

export function PaymentBadges({
  badges,
  className,
}: {
  badges: string[];
  className?: string;
}) {
  if (!badges || badges.length === 0) return null;

  // "card" expands to Visa + Mastercard; the rest map 1:1.
  const items: JSX.Element[] = [];
  for (const id of badges) {
    if (id === "card") {
      items.push(<Visa key="visa" />, <Mastercard key="mc" />);
    } else if (RENDERERS[id]) {
      const C = RENDERERS[id];
      items.push(<C key={id} />);
    }
  }
  if (items.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-1.5 ${className ?? ""}`}
    >
      {items}
    </div>
  );
}
