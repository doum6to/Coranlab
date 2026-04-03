import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import {
  getUserProgress,
  getUserSubscription,
  getListsWithLevels,
} from "@/db/queries";

import { LeconsUnitCarousel } from "./unit-carousel";

const LeconsPage = async () => {
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();
  const listsDataPromise = getListsWithLevels();

  const [userProgress, userSubscription, listsData] = await Promise.all([
    userProgressData,
    userSubscriptionData,
    listsDataPromise,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/learn");
  }

  const isPro = !!userSubscription?.isActive;

  return (
    <div className="flex flex-col px-0 sm:px-6 overflow-hidden">
      <FeedWrapper>
        {listsData.map((unit) => (
          <div key={unit.id} className="mb-10">
            <LeconsUnitCarousel
              id={unit.id}
              order={unit.order}
              title={unit.title}
              description={unit.description}
              lists={unit.lists}
              keyLocked={unit.keyLocked && !isPro}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default LeconsPage;
