import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { auth } from "@/lib/supabase/server";
import db from "@/db/drizzle";
import { userProgress as userProgressTable } from "@/db/schema";

type Props = {
  children: React.ReactNode;
};

const MainLayout = async ({
  children,
}: Props) => {
  const [{ userId }, userProgressData, userSubscription] = await Promise.all([
    auth(),
    getUserProgress(),
    getUserSubscription(),
  ]);
  let userProgress = userProgressData;
  const isPro = !!userSubscription?.isActive;

  // Auto-grant daily key for non-Pro users
  if (userProgress && userId && !isPro) {
    const today = new Date().toISOString().split("T")[0];
    if (userProgress.lastKeyDate !== today) {
      const newKeys = userProgress.keys + 1;
      await db.update(userProgressTable).set({
        keys: newKeys,
        lastKeyDate: today,
      }).where(eq(userProgressTable.userId, userId));
      userProgress = { ...userProgress, keys: newKeys, lastKeyDate: today };
    }
  }

  return (
    <>
      <MobileHeader
        streak={userProgress?.streak}
        keys={userProgress?.keys}
        isPro={isPro}
      />
      <Sidebar
        className="hidden lg:flex"
        streak={userProgress?.streak}
        keys={userProgress?.keys}
        isPro={isPro}
        hasActiveSubscription={isPro}
      />
      <main className="lg:pl-[256px] h-full pt-[50px] lg:pt-0 bg-white">
        <div className="max-w-[1056px] mx-auto pt-4 sm:pt-6 h-full">
          {children}
        </div>
      </main>
    </>
  );
};

export default MainLayout;
