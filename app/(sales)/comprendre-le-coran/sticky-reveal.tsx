"use client";

import { useEffect, useState } from "react";

/**
 * Reveals the sticky buy bar only after the visitor has scrolled past the
 * hero, so it never covers the primary CTA above the fold; it then slides up
 * and stays for the rest of the page.
 */
export function StickyReveal({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {children}
    </div>
  );
}
