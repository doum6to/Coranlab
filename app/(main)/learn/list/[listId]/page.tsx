import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";

import { getListLevels } from "@/db/queries";
import { getListImage } from "@/lib/list-images";

import { LevelCard } from "./level-card";

type Props = {
  params: {
    listId: string;
  };
};

const ListDetailPage = async ({ params }: Props) => {
  const listId = parseInt(params.listId);

  if (isNaN(listId)) {
    redirect("/learn");
  }

  const data = await getListLevels(listId);

  if (!data) {
    redirect("/learn");
  }

  const activeLevel = data.levels.find((l) => !l.completed);

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back button */}
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm text-brilliant-muted hover:text-brilliant-text transition mb-6">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 rounded-2xl overflow-hidden">
          <Image
            src={getListImage(data.listTitle)}
            alt={data.listTitle}
            width={512}
            height={512}
            quality={90}
            className="w-full h-full object-cover mix-blend-darken"
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-brilliant-muted mb-1">
          {data.unitTitle}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-brilliant-text mb-2">
          {data.listTitle}
        </h1>

        <div className="flex items-center justify-center gap-6 text-sm text-brilliant-muted mt-3">
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4" />
            <span>{data.totalLevels} Niveaux</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>{data.vocabWords.length} Mots</span>
          </div>
        </div>
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
              levelName={`Niveau ${level.levelOrder}`}
              levelDescription={`${level.completedChallengeCount}/${level.challengeCount} exercices`}
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
