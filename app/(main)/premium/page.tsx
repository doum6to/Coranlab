import { redirect } from "next/navigation";
import { getUserSubscription } from "@/db/queries";
import { PremiumView } from "./premium-view";

const PremiumPage = async () => {
  const subscription = await getUserSubscription();

  if (subscription?.isActive) {
    redirect("/learn");
  }

  return <PremiumView />;
};

export default PremiumPage;
