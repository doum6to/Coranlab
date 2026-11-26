import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNav } from "@/components/bottom-nav";
import { RivePreloads } from "@/components/rive-preloads";
import { PageReveal } from "@/components/ui/page-reveal";
import { getUserProgress, getUserSubscription, getStreakData } from "@/db/queries";
import { userHasArabicCourse } from "@/lib/arabic-course";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";
import { getServerStrings } from "@/lib/i18n/server-t";

/** Localized <title>/description (the root layout only knows French). */
export function generateMetadata(): Metadata {
  const { t } = getServerStrings();
  return { title: t.meta.title, description: t.meta.description };
}

type Props = {
  children: React.ReactNode;
};

const MainLayout = async ({
  children,
}: Props) => {
  const [userProgress, userSubscription, streakData, hasArabicCourse] =
    await Promise.all([
      getUserProgress(),
      getUserSubscription(),
      getStreakData(),
      userHasArabicCourse(),
    ]);
  const isPro = !!userSubscription?.isActive;
  const locale = getRequestLocale();

  return (
    <LocaleProvider locale={locale}>
      <RivePreloads />
      <MobileHeader streak={userProgress?.streak} isPro={isPro} />
      <Sidebar
        className="hidden lg:flex"
        streak={userProgress?.streak}
        isPro={isPro}
        hasActiveSubscription={isPro}
        streakData={streakData}
        hasArabicCourse={hasArabicCourse}
      />
      {/* On phones the page ends above the floating tab bar */}
      <main className="lg:pl-[256px] h-full pt-[50px] lg:pt-0 bg-white">
        <div className="max-w-[1056px] mx-auto pt-4 sm:pt-6 h-full">
          <PageReveal>{children}</PageReveal>
          <div className="h-[calc(88px+env(safe-area-inset-bottom))] lg:hidden" aria-hidden />
        </div>
      </main>
      <BottomNav />
    </LocaleProvider>
  );
};

export default MainLayout;
