"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lazy-loaded Rive renderer. Use this everywhere in the app so the
 * `@rive-app/react-canvas` runtime (~100kb) is only downloaded when a
 * screen actually shows an animation.
 */
export const LazyRiveAnimation = dynamic(
  () => import("./rive-animation").then((m) => m.RiveAnimation),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  }
);

export const LazyRiveBoolAnimation = dynamic(
  () => import("./rive-animation").then((m) => m.RiveBoolAnimation),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  }
);
