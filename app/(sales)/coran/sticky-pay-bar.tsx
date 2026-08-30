"use client";

import { useEffect, useState } from "react";

/**
 * Bottom sticky bar that lets the visitor jump to the embedded checkout at any
 * time. Appears as soon as the visitor starts scrolling and hides once the
 * checkout box is on screen.
 */
export function StickyPayBar({
  priceLabel,
  compareLabel,
  cta,
  headline,
}: {
  priceLabel: string | null;
  compareLabel: string | null;
  cta: string;
  headline?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show as soon as the visitor starts scrolling.
      const scrolled = window.scrollY > 80;
      // Hide when the checkout itself is visible (no point nagging then).
      let checkoutVisible = false;
      const checkout = document.getElementById("checkout");
      if (checkout) {
        const r = checkout.getBoundingClientRect();
        checkoutVisible = r.top < window.innerHeight && r.bottom > 0;
      }
      setShow(scrolled && !checkoutVisible);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goToCheckout = () => {
    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-[560px] px-4 pb-3 pt-2">
        {headline && (
          <p className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[#6967fb]">
            {headline}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          {priceLabel ? (
            <div className="flex items-baseline gap-2">
              {compareLabel && (
                <span className="text-sm text-neutral-400 line-through">{compareLabel}</span>
              )}
              <span className="text-xl font-extrabold text-neutral-950">{priceLabel}</span>
            </div>
          ) : (
            <span />
          )}
          <button
            onClick={goToCheckout}
            className="rounded-full bg-[#6967fb] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#5856e0]"
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
