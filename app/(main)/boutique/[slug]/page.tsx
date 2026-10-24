import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

import { auth } from "@/lib/supabase/server";
import { getBooksContent } from "@/lib/books-content";
import { getBookReadUrl, getOwnedBookSlugs } from "@/lib/books-access";
import { isBookSlug, localizeBook } from "@/lib/books-shared";
import { getServerStrings } from "@/lib/i18n/server-t";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { books } = await getBooksContent();
  const book = books.find((b) => b.slug === params.slug);
  return { title: book ? `${book.title} — Quranlab` : "Quranlab", robots: { index: false, follow: false } };
}

/** In-app reader: the PDF streams from a signed URL (1 h), never a public link. */
export default async function BookReaderPage({ params }: { params: { slug: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/auth/login");
  if (!isBookSlug(params.slug)) notFound();

  const { t, locale } = getServerStrings();
  const [{ books }, owned] = await Promise.all([getBooksContent(), getOwnedBookSlugs()]);
  const raw = books.find((b) => b.slug === params.slug);
  const book = raw ? localizeBook(raw, locale) : undefined;
  if (!book) notFound();

  const url = owned.has(book.slug) ? await getBookReadUrl(book.slug) : null;

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col px-2 pb-2 sm:h-[calc(100dvh-24px)] sm:px-4">
      <div className="flex items-center justify-between gap-3 py-2">
        <Link href="/boutique?tab=library" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-brilliant-muted hover:text-brilliant-text">
          <ArrowLeft className="h-4 w-4" /> {t.shop.back}
        </Link>
        <h1 className="truncate text-[15px] font-bold text-brilliant-text">{book.title}</h1>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold text-[#6967FB] hover:underline">↗</a>
        ) : <span />}
      </div>
      {url ? (
        <iframe src={`${url}#view=FitH`} title={book.title} className="min-h-0 flex-1 rounded-2xl border border-brilliant-border bg-neutral-100" />
      ) : (
        <div className="mx-auto mt-10 max-w-sm rounded-3xl border border-brilliant-border bg-white p-8 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#EFEFFF] text-[#6967FB]"><Lock className="h-6 w-6" /></span>
          <p className="text-[14px] text-brilliant-muted">{owned.has(book.slug) ? t.shop.unavailable : t.shop.notOwned}</p>
          <Link href="/boutique" className="mt-4 inline-block text-[14px] font-bold text-[#6967FB]">{t.shop.back}</Link>
        </div>
      )}
    </div>
  );
}
