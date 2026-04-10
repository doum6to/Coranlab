import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { PageReveal } from "@/components/ui/page-reveal";
import { getUserProgress, getUserSubscription, getStreakData } from "@/db/queries";

type Props = {
  children: React.ReactNode;
};

const MainLayout = async ({
  children,
}: Props) => {
  const [userProgress, userSubscription, streakData] = await Promise.all([
    getUserProgress(),
    getUserSubscription(),
    getStreakData(),
  ]);
  const isPro = !!userSubscription?.isActive;

  return (
    <>
      <MobileHeader
        streak={userProgress?.streak}
        isPro={isPro}
      />
      <Sidebar
        className="hidden lg:flex"
        streak={userProgress?.streak}
        isPro={isPro}
        hasActiveSubscription={isPro}
        streakData={streakData}
      />
      <main className="lg:pl-[256px] h-full pt-[50px] lg:pt-0 bg-white">
        <div className="max-w-[1056px] mx-auto pt-4 sm:pt-6 h-full">
          <PageReveal>{children}</PageReveal>
        </div>
      </main>
    </>
  );
};

export default MainLayout;
