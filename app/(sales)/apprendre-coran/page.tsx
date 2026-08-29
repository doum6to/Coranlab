import type { Metadata } from "next";

import { getApprendreCoranContent } from "@/lib/apprendre-coran-content";
import { Onboarding } from "./onboarding";

export const metadata: Metadata = {
  title: "Apprends à comprendre le Coran — Quranlab",
  description:
    "En 5 minutes par jour, comprends le Coran en arabe, mot à mot. Réponds à quelques questions et découvre ton plan personnalisé.",
  alternates: { canonical: "https://www.quranlab.app/apprendre-coran" },
  openGraph: {
    title: "Apprends à comprendre le Coran — Quranlab",
    description: "En 5 minutes par jour, comprends le Coran en arabe, mot à mot.",
    url: "https://www.quranlab.app/apprendre-coran",
    images: ["https://www.quranlab.app/hero.png"],
  },
};

export const dynamic = "force-dynamic";

export default async function ApprendreCoranPage() {
  const content = await getApprendreCoranContent();
  return <Onboarding content={content} />;
}
