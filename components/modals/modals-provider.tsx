"use client";

import dynamic from "next/dynamic";

// Modals are loaded lazily — they're only needed when triggered, not on
// first paint. Shaving them off the initial bundle improves TTI.
const ExitModal = dynamic(
  () => import("./exit-modal").then((m) => m.ExitModal),
  { ssr: false }
);

export const ModalsProvider = () => {
  return (
    <>
      <ExitModal />
    </>
  );
};
