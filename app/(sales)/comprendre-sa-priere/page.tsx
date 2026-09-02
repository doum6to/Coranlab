import { getPriereVslContent } from "@/lib/priere-vsl-content";
import { PriereVsl } from "./priere-vsl";

export const revalidate = 60;

export const metadata = {
  title: "Comprends ta prière — Quranlab",
  description:
    "Tu pries sans comprendre ? Apprends les 500 mots qui composent 85% du Coran et ressens enfin ta prière. Accès à vie, sans abonnement.",
};

export default async function ComprendreSaPrierePage() {
  const content = await getPriereVslContent();
  return <PriereVsl content={content} />;
}
