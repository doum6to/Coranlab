import { redirect } from "next/navigation";

import { getListsWithLevels, getStreakData, getUserProgress, getUserSubscription } from "@/db/queries";
import { userHasArabicCourse } from "@/lib/arabic-course";
import { auth, currentUser } from "@/lib/supabase/server";
import { ProfileView } from "@/components/profile-view";

/** The learner's page: streak, XP, levels, and the way to their shop, course and settings. */
const ProfilePage = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/auth/login");

  const [user, userProgress, subscription, streakData, lists, hasArabicCourse] = await Promise.all([
    currentUser(),
    getUserProgress(),
    getUserSubscription(),
    getStreakData(),
    getListsWithLevels(),
    userHasArabicCourse(),
  ]);
  if (!userProgress) redirect("/learn");

  let totalLevels = 0;
  let doneLevels = 0;
  for (const unit of lists) {
    for (const list of unit.lists) {
      totalLevels += list.totalLevels;
      doneLevels += list.completedLevels;
    }
  }

  // Accounts created without a name carry the placeholder "User": the start of the e-mail reads better.
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = userProgress.userName && userProgress.userName !== "User" ? userProgress.userName : email.split("@")[0] || "Quranlab";

  return (
    <ProfileView
      name={name}
      streakData={streakData}
      points={userProgress.points}
      doneLevels={doneLevels}
      totalLevels={totalLevels}
      isPro={!!subscription?.isActive}
      hasArabicCourse={hasArabicCourse}
    />
  );
};

export default ProfilePage;
