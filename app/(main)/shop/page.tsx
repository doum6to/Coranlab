import Image from "next/image";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { getUserProgress, getUserSubscription } from "@/db/queries";

import { Items } from "./items";

const ShopPage = async () => {
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();

  const [
    userProgress,
    userSubscription,
  ] = await Promise.all([
    userProgressData,
    userSubscriptionData
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/learn");
  }

  const isPro = !!userSubscription?.isActive;

  const today = new Date().toISOString().split("T")[0];
  const canClaimKey = userProgress.lastKeyDate !== today;

  return (
    <div className="flex flex-col px-6">
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image
            src="/shop.svg"
            alt="Shop"
            height={90}
            width={90}
          />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
            Boutique
          </h1>
          <p className="text-muted-foreground text-center text-lg mb-6">
            Gagne des clés et débloque de nouvelles parties.
          </p>
          <Items
            keys={userProgress.keys}
            points={userProgress.points}
            hasActiveSubscription={isPro}
            canClaimKey={canClaimKey}
          />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default ShopPage;
