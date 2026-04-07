import { redirect } from "next/navigation";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { auth, currentUser } from "@/lib/supabase/server";
import { SettingsView } from "./settings-view";

const SettingsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/login");
  }

  const [user, userProgress, userSubscription] = await Promise.all([
    currentUser(),
    getUserProgress(),
    getUserSubscription(),
  ]);

  if (!userProgress) {
    redirect("/courses");
  }

  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <SettingsView
      userName={userProgress.userName}
      email={email}
      isPro={!!userSubscription?.isActive}
      subscriptionEndDate={
        userSubscription?.stripeCurrentPeriodEnd?.toISOString() ?? null
      }
      hasStripeCustomer={!!userSubscription?.stripeCustomerId}
    />
  );
};

export default SettingsPage;
