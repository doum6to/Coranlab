import Link from "next/link";
import { BookOpen, Check, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type UnlockedLesson = {
  id: number;
  title: string;
  unitTitle: string;
  completed: boolean;
};

type Props = {
  lessons: UnlockedLesson[];
};

export const LessonsReview = ({ lessons }: Props) => {
  if (lessons.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <div className="flex items-center gap-x-3 mb-6">
        <BookOpen className="h-7 w-7 text-sky-500" />
        <h2 className="text-2xl font-bold text-neutral-700">Leçons</h2>
        <span className="text-sm text-neutral-400">
          ({lessons.length} débloquée{lessons.length > 1 ? "s" : ""})
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lesson/${lesson.id}`}
            className={cn(
              "flex items-center gap-x-3 p-4 rounded-xl border-2 transition hover:shadow-md",
              lesson.completed
                ? "border-green-200 bg-green-50 hover:border-green-300"
                : "border-sky-200 bg-sky-50 hover:border-sky-300"
            )}
          >
            <div className={cn(
              "flex items-center justify-center h-10 w-10 rounded-full",
              lesson.completed ? "bg-green-500" : "bg-sky-500"
            )}>
              {lesson.completed ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <PlayCircle className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-neutral-700 truncate">{lesson.title}</p>
              <p className="text-xs text-neutral-400 truncate">{lesson.unitTitle}</p>
            </div>
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              lesson.completed
                ? "bg-green-200 text-green-700"
                : "bg-sky-200 text-sky-700"
            )}>
              {lesson.completed ? "Réviser" : "En cours"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
