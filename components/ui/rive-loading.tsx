"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import { useState, useEffect } from "react";

/**
 * Full-page loading state powered by loading.riv.
 * Uses the "State Machine loading" state machine.
 * Replaces all skeleton loading screens across the app.
 */
export const RiveLoading = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { RiveComponent } = useRive({
    src: "/animations/loading.riv",
    stateMachines: "State Machine loading",
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-40 w-40 animate-pulse rounded-full bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-48 w-48 sm:h-56 sm:w-56">
        <RiveComponent className="h-full w-full" aria-label="Chargement" />
      </div>
    </div>
  );
};
