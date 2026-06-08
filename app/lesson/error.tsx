"use client";

import { useRouter } from "next/navigation";

import { useT } from "@/lib/i18n/use-t";

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const t = useT();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h2 className="text-xl font-bold text-neutral-800">
        {t.lesson.errorTitle}
      </h2>
      <p className="text-neutral-500 text-sm text-center max-w-sm">
        {error.message || t.lesson.loadError}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#6967fb] text-white rounded-xl font-bold hover:bg-[#6967fb]/90 transition"
        >
          {t.lesson.retry}
        </button>
        <button
          onClick={() => window.location.href = "/learn"}
          className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200 transition"
        >
          {t.lesson.back}
        </button>
      </div>
    </div>
  );
}
