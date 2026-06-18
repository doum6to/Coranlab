import { getDuasLandingContent } from "@/lib/duas-landing-content";
import { DuasLanding } from "./duas-landing";

export const revalidate = 60;

export const metadata = {
  title: "Mon recueil de duas — Quranlab",
};

export default async function DuasPage() {
  const content = await getDuasLandingContent();
  return <DuasLanding content={content} />;
}
