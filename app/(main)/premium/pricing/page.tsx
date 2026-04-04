import { redirect } from "next/navigation";
import { getUserSubscription } from "@/db/queries";
import { PricingView } from "./pricing-view";

const PricingPage = async () => {
  const subscription = await getUserSubscription();

  if (subscription?.isActive) {
    redirect("/learn");
  }

  return <PricingView />;
};

export default PricingPage;
