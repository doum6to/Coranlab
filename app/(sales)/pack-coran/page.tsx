import { getPackContent } from "@/lib/pack-content";
import { PackLanding } from "./pack-landing";

export const revalidate = 60;

export const metadata = {
  title: "Le pack Comprendre 85% du Coran — Guide PDF + bonus, 47 € à vie",
  description:
    "Le guide des 500 mots qui composent 85% du Coran + 4 bonus. Paiement unique, accès à vie, livré par email.",
};

export default async function PackCoranPage() {
  const content = await getPackContent();
  return <PackLanding content={content} />;
}
