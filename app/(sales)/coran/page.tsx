import { getCoranLandingContent } from "@/lib/coran-landing-content";
import { CoranLanding } from "./coran-landing";

export const revalidate = 60;

export const metadata = {
  title: "Comprendre 85% du Coran — Quranlab",
};

export default async function CoranPage() {
  const content = await getCoranLandingContent();
  return <CoranLanding content={content} />;
}
