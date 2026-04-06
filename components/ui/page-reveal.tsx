"use client";

import {
  useRive,
  Layout,
  Fit,
  Alignment,
  EventType,
} from "@rive-app/react-canvas";
import { useState, useEffect, useRef } from "react";

/**
 * Wraps page content with a full-screen Rive loading overlay.
 * The overlay plays `loading.riv` ("State Machine loading") and waits
 * until the "clin d'oeil" state fires before cross-fading to children.
 */
export const PageReveal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [cycleDone, setCycleDone] = useState(false);
  const [overlayHidden, setOverlayHidden] = useState(false);

  useEffect(() => setMounted(true), []);

  const { rive, RiveComponent } = useRive({
    src: "/animations/loading.riv",
    stateMachines: "State Machine loading",
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  // Wait for the "clin d'oeil" state to fire before revealing content.
  useEffect(() => {
    if (!rive) return;

    const handler = (event: any) => {
      // event.data is an array of state names that just became active
      const names: string[] = Array.isArray(event?.data)
        ? event.data
        : typeof event?.data === "string"
          ? [event.data]
          : [];

      if (names.some((n) => n.toLowerCase().includes("clin"))) {
        setCycleDone(true);
      }
    };

    rive.on(EventType.StateChange, handler);
    return () => {
      rive.off(EventType.StateChange, handler);
    };
  }, [rive]);

  // Safety fallback: reveal after 5s max if event never fires.
  useEffect(() => {
    const t = setTimeout(() => setCycleDone(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // When cycleDone, start fade-out, then fully remove the overlay.
  useEffect(() => {
    if (!cycleDone) return;
    const t = setTimeout(() => setOverlayHidden(true), 500);
    return () => clearTimeout(t);
  }, [cycleDone]);

  // SSR / pre-mount: render children directly (no flash).
  if (!mounted) {
    return <>{children}</>;
  }

  // Once overlay is fully gone, render only children (no extra DOM).
  if (overlayHidden) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Loading overlay */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-500"
        style={{ opacity: cycleDone ? 0 : 1 }}
        aria-hidden={cycleDone}
      >
        <div className="h-48 w-48 sm:h-56 sm:w-56">
          <RiveComponent className="h-full w-full" aria-label="Chargement" />
        </div>
      </div>

      {/* Page content renders underneath, visible once overlay fades */}
      <div
        className="transition-opacity duration-500"
        style={{ opacity: cycleDone ? 1 : 0 }}
      >
        {children}
      </div>
    </>
  );
};
