import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import {
  getUserProgress,
  getListsWithLevels,
} from "@/db/queries";

import { LeconsUnitCarousel } from "./unit-carousel";

const LeconsPage = async () => {
  const [userProgress, listsData] = await Promise.all([
    getUserProgress(),
    getListsWithLevels(),
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/learn");
  }

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
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default LeconsPage;
