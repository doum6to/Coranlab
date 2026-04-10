"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VocabList } from "@/db/queries";
import { cn } from "@/lib/utils";

import { UnitBanner } from "./unit-banner";
import { ListCard } from "./list-card";

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
  const [isMobile, setIsMobile] = useState(false);

  const activeListId = lists.find((l) => l.completedLevels < l.totalLevels)?.listId;

  const rafRef = useRef<number>(0);

  const updateCardScales = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !isMobile) return;

    const cards = el.querySelectorAll("[data-list-card]") as NodeListOf<HTMLElement>;
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const timer = setTimeout(() => {
      checkScroll();
      updateCardScales();

      if (activeListId) {
        const activeIndex = lists.findIndex((l) => l.listId === activeListId);
        if (activeIndex > 0) {
          const cards = el.querySelectorAll("[data-list-card]");
          if (cards[activeIndex]) {
            const card = cards[activeIndex] as HTMLElement;
            const scrollPos = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
            el.scrollTo({ left: Math.max(0, scrollPos), behavior: "smooth" });
          }
        }
      }
    }, 50);

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

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
