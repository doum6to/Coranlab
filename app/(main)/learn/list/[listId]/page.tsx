import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";

import { getListLevels, isListPremiumLocked } from "@/db/queries";
import { getServerStrings } from "@/lib/i18n/server-t";
import { tpl } from "@/lib/i18n/locales";

import { LevelCard } from "./level-card";

type Props = {
  params: {
    listId: string;
  };
};

const ListDetailPage = async ({ params }: Props) => {
  const { t } = getServerStrings();
  const listId = parseInt(params.listId);

  if (isNaN(listId)) {
    redirect("/learn");
  }

  if (await isListPremiumLocked(listId)) {
    redirect("/premium");
  }

  const data = await getListLevels(listId);

  if (!data) {
    redirect("/learn");
  }

  const activeLevel = data.levels.find((l) => !l.completed);

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-8 pt-1">
      {/* Back: a full-size target, not a line of small text */}
      <Link href="/learn" className="-ml-2.5 inline-flex min-h-[44px] select-none items-center gap-1.5 rounded-full px-2.5 text-[0.9375rem] font-semibold text-[#6B6B76] transition-colors active:bg-[#F3F3F7]">
        <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden />
        {t.lesson.back}
      </Link>

      <div className="mb-8 mt-2 text-center">
        <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-3xl sm:h-28 sm:w-28">
          <Image src={data.listImage} alt="" width={512} height={512} quality={90} className="h-full w-full object-cover mix-blend-darken" />
        </div>
        <p className="text-[0.8125rem] font-medium text-brilliant-muted">{data.unitTitle}</p>
        <h1 className="mt-0.5 font-heading text-[1.5rem] font-extrabold leading-tight text-brilliant-text" style={{ letterSpacing: "-0.01em", textWrap: "balance" as never }}>{data.listTitle}</h1>
        <p className="mt-2 flex items-center justify-center gap-4 text-[0.9375rem] font-medium text-[#6B6B76]">
          <span className="flex items-center gap-1.5"><Layers className="h-4 w-4" strokeWidth={2.2} aria-hidden />{tpl(t.learn.levels, { n: data.totalLevels })}</span>
          <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" strokeWidth={2.2} aria-hidden />{tpl(t.learn.words, { n: data.vocabWords.length })}</span>
        </p>
      </div>

      {/* Level nodes */}
      <div className="flex flex-col items-center gap-0">
        {data.levels.map((level, index) => {
          const isActive = level.id === activeLevel?.id;
          const isLocked = !level.completed && !isActive;

          return (
            <LevelCard
              key={level.id}
              lessonId={level.id}
              levelOrder={level.levelOrder}
              levelName={tpl(t.common.levelN, { n: level.levelOrder })}
              levelDescription={tpl(t.learn.exercises, { done: level.completedChallengeCount, total: level.challengeCount })}
              completed={level.completed}
              locked={isLocked}
              active={isActive}
              percentage={level.percentage}
              isLast={index === data.levels.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ListDetailPage;
