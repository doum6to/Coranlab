import { cn } from "@/lib/utils";

/**
 * Loading states with the shape of the page that is coming. A tab that opens on its own
 * outline feels immediate; a full-screen animation between every screen feels like a wait.
 */
export function Sk({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("animate-pulse rounded-xl bg-[#F0F0F4]", className)} style={style} aria-hidden />;
}

function Frame({ children, className, label = "Chargement" }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <div className={cn("mx-auto w-full", className)} role="status" aria-label={label}>
      {children}
    </div>
  );
}

function UnitBlock() {
  return (
    <div className="mb-10">
      <Sk className="mx-4 h-[84px] rounded-2xl sm:mx-0" />
      <div className="mt-4 flex gap-3 overflow-hidden px-4 sm:px-0">
        <Sk className="h-[300px] w-[220px] shrink-0 rounded-2xl" />
        <Sk className="h-[300px] w-[220px] shrink-0 rounded-2xl" />
        <Sk className="hidden h-[300px] w-[220px] shrink-0 rounded-2xl sm:block" />
      </div>
    </div>
  );
}

/** Home: Koji and his bubble, the card of the day, the daily goal, then the units. */
export function HomeSkeleton() {
  return (
    <Frame className="px-0 sm:px-6">
      <div className="mx-auto mb-8 w-full max-w-md px-4 pt-2 sm:px-0">
        <div className="flex items-center gap-3">
          <Sk className="h-[84px] w-[84px] shrink-0 rounded-full" />
          <Sk className="h-[52px] flex-1 rounded-[18px]" />
        </div>
        <Sk className="mt-5 h-[196px]" style={{ borderRadius: 28 }} />
        <Sk className="mt-4 h-[150px]" style={{ borderRadius: 24 }} />
      </div>
      <UnitBlock />
    </Frame>
  );
}

/** Review tab: units and their lists. */
export function UnitsSkeleton() {
  return (
    <Frame className="px-0 pt-2 sm:px-6">
      <UnitBlock />
      <UnitBlock />
    </Frame>
  );
}

/** A list: its picture, its title, then its levels one under the other. */
export function ListSkeleton() {
  return (
    <Frame className="max-w-md px-4 py-6 sm:px-6 sm:py-10">
      <Sk className="h-4 w-16" />
      <Sk className="mx-auto mt-6 h-24 w-24 rounded-2xl" />
      <Sk className="mx-auto mt-4 h-3 w-32" />
      <Sk className="mx-auto mt-2 h-7 w-56" />
      <div className="mt-8 flex flex-col gap-4">
        {[0, 1, 2, 3].map((i) => <Sk key={i} className="h-[76px] rounded-2xl" />)}
      </div>
    </Frame>
  );
}

/** Ranking: a title, the league card, then the rows. */
export function RankingSkeleton() {
  return (
    <Frame className="max-w-md px-6">
      <Sk className="mx-auto my-6 h-7 w-40" />
      <Sk className="h-[120px] rounded-2xl" />
      <div className="mt-5 flex flex-col gap-2.5">
        {[0, 1, 2, 3, 4, 5].map((i) => <Sk key={i} className="h-[56px] rounded-2xl" />)}
      </div>
    </Frame>
  );
}

/** Profile: the learner, the streak card, then the links. */
export function ProfileSkeleton() {
  return (
    <Frame className="max-w-md px-4 pb-8 pt-2">
      <div className="flex items-center gap-3">
        <Sk className="h-14 w-14 shrink-0 rounded-full" />
        <Sk className="h-7 w-40" />
      </div>
      <Sk className="mt-5 h-[270px]" style={{ borderRadius: 28 }} />
      <div className="mt-6 flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => <Sk key={i} className="h-[44px]" />)}
      </div>
    </Frame>
  );
}

/** Settings and other simple pages: a title and a column of rows. */
export function RowsSkeleton() {
  return (
    <Frame className="max-w-xl px-4 py-6 sm:px-6">
      <Sk className="h-7 w-44" />
      <div className="mt-6 flex flex-col gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => <Sk key={i} className="h-[60px] rounded-2xl" />)}
      </div>
    </Frame>
  );
}

/** A lesson about to open: the progress bar, the question, the word and its answers, the button. */
export function LessonSkeleton() {
  return (
    <div className="flex h-[100dvh] flex-col" role="status" aria-label="Chargement">
      <div className="mx-auto flex w-full max-w-[1140px] items-center gap-3 px-4 pb-2 pt-3 sm:px-10 lg:pt-[50px]">
        <Sk className="h-6 w-6 rounded-full" />
        <Sk className="h-3 flex-1 rounded-full" />
        <Sk className="h-5 w-10" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-lg flex-col items-center gap-5 px-4 sm:px-6">
          <Sk className="h-6 w-64" />
          <Sk className="h-[120px] w-full max-w-[300px] rounded-3xl" />
          <div className="flex w-full max-w-md flex-col gap-3">
            {[0, 1, 2, 3].map((i) => <Sk key={i} className="h-[56px] rounded-2xl" />)}
          </div>
        </div>
      </div>
      <div className="border-t border-[#E0E0E0] px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-3 sm:px-6">
        <Sk className="mx-auto h-[54px] w-full max-w-lg rounded-2xl" />
      </div>
    </div>
  );
}
