import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock } from "lucide-react";

import { getAllArticles, getArticleBySlug } from "@/lib/blog/articles";
import { absoluteUrl } from "@/lib/utils";
import { JsonLd } from "@/components/blog/json-ld";
import { BlogCTA } from "@/components/blog/blog-cta";

export const dynamic = "force-static";
export const revalidate = 86400; // 24 h

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};

  const url = absoluteUrl(`/blog/${article.slug}`);

  return {
    title: `${article.title} | Quranlab`,
    description: article.description,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      siteName: "Quranlab",
      locale: "fr_FR",
      type: "article",
      publishedTime: article.publishedAt,
      images: [
        {
          url: absoluteUrl("/hero.png"),
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [absoluteUrl("/hero.png")],
    },
    alternates: { canonical: url },
  };
}

export default function BlogArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const Content = article.content;
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "fr-FR",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <>
      <JsonLd
        type="article"
        title={article.title}
        description={article.description}
        slug={article.slug}
        publishedAt={article.publishedAt}
      />

      <div className="w-full">
        {/* ─── Centered hero header ─── */}
        <header className="max-w-[720px] mx-auto px-5 sm:px-6 pt-8 sm:pt-12 pb-10 sm:pb-14 text-center">
          {/* Breadcrumb — left-aligned */}
          <nav className="mb-8 sm:mb-10 text-left">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-brilliant-muted hover:text-[#6967fb] transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au blog
            </Link>
          </nav>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-bold font-heading text-[#6967fb] leading-tight max-w-[600px] mx-auto">
            {article.title}
          </h1>

          {/* Description */}
          <p className="mt-4 text-brilliant-muted text-base sm:text-lg leading-relaxed max-w-[520px] mx-auto">
            {article.description}
          </p>

          {/* Date + reading time */}
          <div className="mt-5 flex items-center justify-center gap-3 text-sm text-brilliant-muted">
            <time dateTime={article.publishedAt}>{formattedDate}</time>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readingTime} min de lecture
            </span>
          </div>

          {/* Hero image */}
          <div className="mt-8 sm:mt-10 relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] mx-auto">
            <Image
              src="/hero.png"
              fill
              alt={article.title}
              className="object-contain"
              style={{ mixBlendMode: "multiply" }}
              sizes="220px"
            />
          </div>

          {/* Mini CTA */}
          <div className="mt-8">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-[#6967fb] px-7 py-3 text-sm font-bold text-white uppercase tracking-wide shadow-[0_4px_0_0_#5250d4] transition hover:scale-[1.02] active:scale-[0.97] active:shadow-[0_2px_0_0_#5250d4] active:translate-y-[2px]"
            >
              Apprendre le vocabulaire du Coran
            </Link>
          </div>
        </header>

        {/* ─── Article body — left-aligned ─── */}
        <div className="max-w-[720px] mx-auto px-5 sm:px-6 pb-8 sm:pb-12">
          <article className="prose prose-lg prose-slate max-w-none prose-headings:font-heading prose-headings:text-brilliant-text prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-brilliant-border prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-p:text-brilliant-text/80 prose-p:leading-relaxed prose-li:text-brilliant-text/80 prose-a:text-[#6967fb] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-strong:text-brilliant-text prose-ul:my-4 prose-li:my-1">
            <Content />
          </article>

          {/* Tags */}
          <section className="mt-10 sm:mt-12 pt-8 border-t border-brilliant-border">
            <h2 className="text-sm font-heading font-bold text-brilliant-muted uppercase tracking-wide mb-4">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {article.keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-block rounded-lg bg-[#e0f4fd] px-4 py-2 text-xs font-bold text-[#2AABDB] uppercase tracking-wide"
                >
                  {kw}
                </span>
              ))}
            </div>
          </section>

          {/* CTA */}
          <BlogCTA />
        </div>
      </div>
    </>
  );
}
