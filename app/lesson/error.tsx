"use client";

import { useRouter } from "next/navigation";

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h2 className="text-xl font-bold text-neutral-800">
        Erreur de chargement
      </h2>
      <p className="text-neutral-500 text-sm text-center max-w-sm">
        {error.message || "Impossible de charger la leçon."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#6967fb] text-white rounded-xl font-bold hover:bg-[#6967fb]/90 transition"
        >
          Réessayer
        </button>
        <button
          onClick={() => window.location.href = "/learn"}
          className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-bold hover:bg-neutral-200 transition"
        >
          Retour
        </button>
      </div>
    </div>
  );
}
