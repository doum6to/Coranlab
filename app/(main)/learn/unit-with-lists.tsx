"use client";

import { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { VocabList } from "@/db/queries";
import { cn } from "@/lib/utils";

import { UnitBanner } from "./unit-banner";
import { ListCard } from "./list-card";

// Run before paint on the client; fall back to useEffect on the server (SSR)
// so React doesn't warn about useLayoutEffect having no effect there.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Props = {
  id: number;
  order: number;
  title: string;
  description: string;
  lists: VocabList[];
};

export const UnitWithListsView = ({
  id,
  order,
  title,
  description,
  lists,
}: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  // Initialise from the real viewport so the first client render already knows
  // whether to scale cards — avoids a full-size → scaled "jump" on mount.
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );

  const activeListId = lists.find((l) => l.completedLevels < l.totalLevels)?.listId;

  const rafRef = useRef<number>(0);

  const updateCardScales = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const cards = el.querySelectorAll("[data-list-card]") as NodeListOf<HTMLElement>;

    // Desktop: no scaling. Clear any inline styles left over from mobile (e.g.
    // after a resize / orientation change) so cards don't stay stuck shrunk.
    if (!isMobile) {
      cards.forEach((card) => {
        card.style.transform = "";
        card.style.opacity = "";
      });
      return;
    }

    const containerCenter = el.scrollLeft + el.clientWidth / 2;

    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      const maxDist = el.clientWidth * 0.6;
      const ratio = Math.max(0, 1 - distance / maxDist);
      const scale = 0.9 + ratio * 0.1;
      const opacity = 0.6 + ratio * 0.4;
      card.style.transform = `scale(${scale})`;
      card.style.opacity = `${opacity}`;
    });
  }, [isMobile]);

  const checkScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
      updateCardScales();
    });
  }, [updateCardScales]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Position to the active list + apply card scales BEFORE the first paint.
  // The (main) layout remounts when returning to /learn (e.g. after a lesson),
  // so doing this in a layout effect (instant scroll, not "smooth") prevents
  // the brief flash of full-size / mis-scrolled cards the user could see.
  useIsomorphicLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (activeListId) {
      const activeIndex = lists.findIndex((l) => l.listId === activeListId);
      if (activeIndex > 0) {
        const cards = el.querySelectorAll("[data-list-card]");
        const card = cards[activeIndex] as HTMLElement | undefined;
        if (card) {
          el.scrollLeft = Math.max(
            0,
            card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
          );
        }
      }
    }

    updateCardScales();
    checkScroll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Scroll / resize listeners (re-attached if the mobile breakpoint changes).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="w-full pt-4">
      <div className="px-4 sm:px-0">
        <UnitBanner title={title} description={description} showReviser />
      </div>

      {/* Carousel container */}
      <div className="relative mt-4">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-brilliant-border shadow-md items-center justify-center hover:bg-brilliant-surface transition hidden sm:flex"
          >
            <ChevronLeft className="h-4 w-4 text-brilliant-text" />
          </button>
        )}

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory scrollbar-hide items-center"
        >
          {/* Left spacer on mobile */}
          <div className="shrink-0 w-[calc((100vw-220px)/2)] sm:hidden" />
          {lists.map((list) => {
            const isCurrent = list.listId === activeListId;
            const isCompleted = list.completedLevels === list.totalLevels;
            const isPremiumLocked = list.isPremiumLocked;

            return (
              <div
                key={list.listId}
                className="snap-center sm:snap-start shrink-0 sm:transition-all sm:duration-300 sm:ease-out will-change-transform"
                data-list-card
              >
                <ListCard
                  listId={list.listId}
                  listTitle={list.listTitle}
                  current={!isPremiumLocked && isCurrent}
                  locked={false}
                  completed={isCompleted}
                  completedLevels={list.completedLevels}
                  totalLevels={list.totalLevels}
                  isPremiumLocked={isPremiumLocked}
                  activeLessonId={list.activeLevel?.id || list.levels[0]?.id}
                />
              </div>
            );
          })}
          {/* Right spacer on mobile */}
          <div className="shrink-0 w-[calc((100vw-220px)/2)] sm:hidden" />
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-brilliant-border shadow-md items-center justify-center hover:bg-brilliant-surface transition hidden sm:flex"
          >
            <ChevronRight className="h-4 w-4 text-brilliant-text" />
          </button>
        )}

        {/* Dot indicators */}
        <CarouselDots lists={lists} scrollRef={scrollRef} activeListId={activeListId} />
      </div>
    </div>
  );
};

// Dot indicator component
const CarouselDots = ({
  lists,
  scrollRef,
  activeListId,
}: {
  lists: VocabList[];
  scrollRef: React.RefObject<HTMLDivElement>;
  activeListId?: number;
}) => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const cards = el.querySelectorAll("[data-list-card]");
      const center = el.scrollLeft + el.clientWidth / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      cards.forEach((card, i) => {
        const cardEl = card as HTMLElement;
        const cardCenter = cardEl.offsetLeft + cardEl.offsetWidth / 2;
        const dist = Math.abs(center - cardCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });
      setActiveIdx(closestIdx);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  if (lists.length <= 1) return null;

  return (
    <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
      {lists.map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            i === activeIdx ? "bg-[#6967FB] scale-125" : "bg-brilliant-border"
          )}
        />
      ))}
    </div>
  );
};
