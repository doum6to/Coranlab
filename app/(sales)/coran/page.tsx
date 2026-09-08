import { getCoranLandingContent } from "@/lib/coran-landing-content";
import { CoranLanding } from "./coran-landing";

export const revalidate = 60;

export async function generateMetadata() {
  const content = await getCoranLandingContent();
  return {
    title: `${content.title} — QuranLab`,
    description: content.subtitle || content.editorial?.introduction || undefined,
  };
}

export default async function CoranPage() {
  const content = await getCoranLandingContent();
  return <CoranLanding content={content} />;
}
