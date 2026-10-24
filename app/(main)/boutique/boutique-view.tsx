"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BadgeCheck, Check, Lock, BookOpen } from "lucide-react";

import { createBookCheckout } from "@/actions/book-checkout";
import { track } from "@/lib/analytics/track";
import type { Book, BooksContent } from "@/lib/books-shared";
import { tpl } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { BookCover } from "./book-cover";

const PURPLE = "#6967FB";

export function BoutiqueView({
  content, ownedSlugs, isPro, bought, initialTab, strings,
}: {
  content: BooksContent;
  ownedSlugs: string[];
  isPro: boolean;
  bought: string | null;
  initialTab: "shop" | "library";
  strings: { bought: string; notice: string };
}) {
  const [tab, setTab] = useState<"shop" | "library">(initialTab);
  const owned = new Set(ownedSlugs);
  const library = content.books.filter((b) => owned.has(b.slug));
  const boughtBook = bought ? content.books.find((b) => b.slug === bought) : null;

  return (
    <div className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mt-2 text-center font-heading text-[26px] font-bold text-brilliant-text sm:text-[30px]">{content.shopTitle}</h1>
        <p className="mt-1 text-center text-[14px] text-brilliant-muted">{content.shopSubtitle}</p>

        {strings.notice && (
          <p className="mx-auto mt-4 max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-[13px] font-medium text-amber-800">{strings.notice}</p>
        )}

        {boughtBook && (
          <div className="mx-auto mt-5 flex max-w-md items-center gap-2 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[14px] font-semibold text-[#166534]">
            <Check className="h-4 w-4" /> {strings.bought} — {boughtBook.title}
          </div>
        )}

        {/* Tabs */}
        <div className="mx-auto mt-6 flex max-w-md rounded-full bg-[#F0F0F0] p-1" role="tablist">
          {(["shop", "library"] as const).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={cn("flex-1 rounded-full py-2.5 text-[15px] font-bold transition", tab === k ? "bg-white text-brilliant-text shadow-sm" : "text-brilliant-muted")}
            >
              {k === "shop" ? content.tabShop : content.tabLibrary}
            </button>
          ))}
        </div>

        {tab === "shop" ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            {content.books.map((b) => (
              <ShopCard key={b.slug} book={b} owned={owned.has(b.slug)} isPro={isPro} content={content} />
            ))}
          </div>
        ) : library.length === 0 ? (
          <div className="mx-auto mt-10 max-w-sm rounded-3xl border border-brilliant-border bg-white p-8 text-center">
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "#EFEFFF", color: PURPLE }}><BookOpen className="h-6 w-6" /></span>
            <p className="text-[14px] text-brilliant-muted">{content.emptyLibrary}</p>
            <button onClick={() => setTab("shop")} className="mt-4 text-[14px] font-bold" style={{ color: PURPLE }}>{content.tabShop} →</button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            {library.map((b) => (
              <Link key={b.slug} href={`/boutique/${b.slug}`} className="group block">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,.35)] transition group-hover:-translate-y-0.5">
                  <BookCover book={b} />
                </div>
                <p className="mt-2 text-[14px] font-bold text-brilliant-text">{b.title}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[13px] font-bold" style={{ color: PURPLE }}><BookOpen className="h-3.5 w-3.5" /> {content.readLabel}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShopCard({ book, owned, isPro, content }: { book: Book; owned: boolean; isPro: boolean; content: BooksContent }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const premiumOnly = book.includedWithPremium;

  const buy = () =>
    start(async () => {
      setErr(null);
      track(`shop_buy_${book.slug}`);
      try {
        const res = await createBookCheckout(book.slug, { from: "boutique" });
        if ("url" in res && res.url) { window.location.href = res.url; return; }
        setErr(("error" in res && res.error) || "Erreur");
      } catch { setErr("Erreur"); }
    });

  return (
    <div className="flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_10px_30px_-15px_rgba(0,0,0,.35)]">
        {owned ? (
          <Link href={`/boutique/${book.slug}`} className="block h-full w-full"><BookCover book={book} /></Link>
        ) : (
          <BookCover book={book} />
        )}
        {owned && (
          <span className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full text-white shadow" style={{ background: PURPLE }} aria-label={content.ownedLabel}>
            <BadgeCheck className="h-5 w-5" />
          </span>
        )}
        {!owned && premiumOnly && (
          <span className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brilliant-muted shadow"><Lock className="h-4 w-4" /></span>
        )}
      </div>
      <p className="mt-2 text-[14px] font-bold leading-tight text-brilliant-text">{book.title}</p>
      <p className="text-[12px] text-brilliant-muted">{book.meta}</p>

      {owned ? (
        <Link href={`/boutique/${book.slug}`} className="mt-2 text-[13.5px] font-bold" style={{ color: PURPLE }}>
          {premiumOnly && isPro ? content.includedLabel : content.ownedLabel} · {content.readLabel} →
        </Link>
      ) : premiumOnly ? (
        <Link href="/premium" className="mt-2 inline-flex items-center gap-1 text-[13.5px] font-bold" style={{ color: PURPLE }}>
          <Lock className="h-3.5 w-3.5" /> {content.premiumLabel}
        </Link>
      ) : (
        <>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[17px] font-extrabold" style={{ color: PURPLE }}>{book.priceLabel}</span>
            {book.compareLabel && <span className="text-[12px] text-brilliant-muted line-through">{book.compareLabel}</span>}
          </div>
          <button
            onClick={buy}
            disabled={pending}
            className="mt-2 w-full rounded-xl py-2.5 text-[13.5px] font-bold text-white transition hover:opacity-90 active:translate-y-[2px] disabled:opacity-60"
            style={{ background: PURPLE, boxShadow: "0 3px 0 0 #4a48d4" }}
          >
            {pending ? "…" : tpl(content.buyLabel, { price: book.priceLabel })}
          </button>
          {err && <p className="mt-1 text-[12px] text-rose-500">{err}</p>}
        </>
      )}
    </div>
  );
}
