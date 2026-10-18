import type { Book } from "@/lib/books-shared";

/** Book cover: the uploaded image, or a generated typographic cover. */
export function BookCover({ book, className = "" }: { book: Book; className?: string }) {
  if (book.cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={book.cover} alt={book.title} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div
      className={`flex h-full w-full flex-col justify-between p-4 text-white ${className}`}
      style={{ background: `linear-gradient(160deg, ${book.color} 0%, color-mix(in srgb, ${book.color} 55%, #000) 100%)` }}
    >
      <span className="text-[9px] font-bold uppercase tracking-[.25em] opacity-80">Quranlab</span>
      <div>
        <p className="font-serif text-[20px] font-semibold leading-tight">{book.title}</p>
        <p className="mt-1 text-[11px] opacity-85">{book.subtitle}</p>
      </div>
      <span className="self-start font-arabic text-[22px] opacity-80" dir="rtl">ٱلْقُرْآن</span>
    </div>
  );
}
