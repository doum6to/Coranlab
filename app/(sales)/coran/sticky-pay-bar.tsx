"use client";

import { useEffect, useState } from "react";

/**
 * Bottom sticky bar that lets the visitor jump to the embedded checkout at any
 * time. Appears after a little scroll and hides once the checkout is on screen.
 */
export function StickyPayBar({
  priceLabel,
  compareLabel,
  cta,
}: {
  priceLabel: string | null;
  compareLabel: string | null;
  cta: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkout = document.getElementById("checkout");

    const onScroll = () => {
      const scrolled = window.scrollY > 360;
      // Hide when the checkout itself is visible (no point nagging then).
      let checkoutVisible = false;
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
    >
      <div className="mx-auto flex max-w-[560px] items-center justify-between gap-3 px-4 py-3">
        {priceLabel ? (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-neutral-950">{priceLabel}</span>
            {compareLabel && (
              <span className="text-sm text-neutral-400 line-through">{compareLabel}</span>
            )}
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
  );
}
