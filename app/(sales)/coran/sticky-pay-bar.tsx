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
  accentColor,
}: {
  priceLabel: string | null;
  compareLabel: string | null;
  cta: string;
  headline?: string;
  accentColor?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show as soon as the visitor starts scrolling.
      const hero = document.getElementById("coran-hero");
      const scrolled = hero ? hero.getBoundingClientRect().bottom <= 0 : window.scrollY > 400;
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
    document.getElementById("checkout")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  return (
    <div
      hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-[#D9D0C1] bg-[#EFE9DE]/95 backdrop-blur transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-[560px] px-4 pb-3 pt-2">
        {headline && (
          <p style={accentColor ? { color: accentColor } : undefined} className="mb-1.5 text-center text-xs font-semibold uppercase tracking-[.2em] text-[#5B4A40]">
            {headline}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          {priceLabel ? (
            <div className="flex items-baseline gap-2">
              {compareLabel && (
                <span className="text-sm text-[#8B7D74] line-through">{compareLabel}</span>
              )}
              <span className="text-xl font-extrabold text-[#2B1D16]">{priceLabel}</span>
            </div>
          ) : (
            <span />
          )}
          <button
            data-coran-cta
            onClick={goToCheckout}
            style={accentColor ? { backgroundColor: accentColor } : undefined}
            className="rounded-full bg-[#3A281F] px-6 py-3 text-sm font-bold text-[#EFE9DE] shadow-sm transition hover:bg-[#2B1D16]"
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
