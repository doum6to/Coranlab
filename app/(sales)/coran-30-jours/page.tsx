import { getEbook30Content } from "@/lib/ebook30-content";
import { Ebook30Landing } from "./ebook30-landing";

export const revalidate = 60;

export const metadata = {
  title: "Comprendre 85% du Coran en 30 jours — Quranlab",
  description:
    "L'ebook pour comprendre les 500 mots qui composent 85% du Coran, en 30 jours. Format numérique, accès à vie.",
};

export default async function Coran30JoursPage() {
  const content = await getEbook30Content();
  return <Ebook30Landing content={content} />;
}
