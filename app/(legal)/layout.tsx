import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#FAF8F3] text-neutral-900">
      <div className="mx-auto max-w-[720px] px-5 py-10 sm:py-14">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6967fb] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <article className="prose prose-neutral max-w-none prose-headings:font-display prose-h1:text-3xl prose-h2:mt-8 prose-h2:text-xl prose-a:text-[#6967fb]">
          {children}
        </article>
        <p className="mt-12 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} Quranlab. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
