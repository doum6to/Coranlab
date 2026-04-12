import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Clock } from "lucide-react";

import { getAllArticles } from "@/lib/blog/articles";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog - Quranlab | Apprendre le Coran et le vocabulaire coranique",
  description:
    "Articles et guides pour apprendre le vocabulaire du Coran, le tajwid et mémoriser le Coran efficacement.",
  openGraph: {
    title: "Blog Quranlab — Guides pour apprendre le Coran",
    description:
      "Articles et guides pour apprendre le vocabulaire du Coran, le tajwid et mémoriser le Coran efficacement.",
    url: "https://www.quranlab.app/blog",
    siteName: "Quranlab",
    locale: "fr_FR",
    type: "website",
  },
  alternates: { canonical: "https://www.quranlab.app/blog" },
};

export default function BlogIndexPage() {
  const articles = getAllArticles();

  return (
    <div className="max-w-[988px] mx-auto w-full px-5 sm:px-6 py-10 sm:py-16">
      {/* Hero header */}
      <div className="mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#6967fb]/10 px-4 py-1.5 text-sm font-semibold text-[#6967fb] mb-4">
          <BookOpen className="h-4 w-4" />
          Blog
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-brilliant-text mb-3">
          Apprends le Coran, mot par mot.
        </h1>
        <p className="text-brilliant-muted text-sm sm:text-base max-w-lg">
          Guides pratiques, astuces et méthodes pour apprendre le vocabulaire
          coranique, le tajwid et mémoriser le Coran efficacement.
        </p>
      </div>

      {/* Article grid */}
      <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => {
          const formattedDate = new Date(
            article.publishedAt,
          ).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group relative rounded-2xl border-2 border-brilliant-border border-b-4 bg-white p-5 sm:p-6 transition-all hover:border-[#6967fb]/40 hover:shadow-md hover:scale-[1.01] active:scale-[0.98] active:border-b-2"
            >
              {/* Category pill */}
              <div className="inline-block rounded-lg bg-[#e0f4fd] px-3 py-1 text-[10px] font-bold text-[#2AABDB] uppercase tracking-wide mb-3">
                {article.keywords[0]}
              </div>

              <h2 className="text-base sm:text-lg font-bold font-heading text-brilliant-text group-hover:text-[#6967fb] transition-colors leading-snug">
                {article.title}
              </h2>

              <p className="mt-2 text-sm text-brilliant-muted line-clamp-3 leading-relaxed">
                {article.description}
              </p>

              <div className="mt-4 flex items-center gap-3 text-xs text-brilliant-muted">
                <time dateTime={article.publishedAt}>{formattedDate}</time>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readingTime} min
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
