"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h2 className="text-xl font-bold text-neutral-800">
            Une erreur est survenue
          </h2>
          <p className="text-neutral-500 text-sm">
            {error.message}
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#6967fb] text-white rounded-xl font-bold hover:bg-[#6967fb]/90 transition"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
