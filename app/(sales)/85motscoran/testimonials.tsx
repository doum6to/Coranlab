import fs from "fs";
import path from "path";

import Image from "next/image";

/**
 * Real TikTok review screenshots with an editorial fallback.
 *
 * If `public/testimonials/{slug}.png` exists, the component renders the
 * real screenshot (highest credibility). Otherwise it renders a refined
 * quote card that still carries the message cleanly.
 */

type Testimonial = {
  slug: string;
  username: string;
  date: string;
  comment: string;
  likes: number;
};

const TESTIMONIALS: Testimonial[] = [
  {
    slug: "moisix",
    username: "Moisix._",
    date: "30 avril 2025",
    comment:
      "Honnêtement, je ne m'attendais pas à une telle qualité pour ce prix. C'est une excellente surprise et je recommande ce produit à 100%.",
    likes: 90,
  },
  {
    slug: "nora-ecom",
    username: "Nora Ecom",
    date: "18 avril 2026",
    comment:
      "Je suis venue voir les avis, je ne suis pas déçue. Qu'Allah vous récompense.",
    likes: 1,
  },
  {
    slug: "azzedine",
    username: "Azzedine",
    date: "9 juillet 2025",
    comment:
      "Je viens de l'acheter, il a l'air très complet. Qu'Allah vous récompense !",
    likes: 2,
  },
];

function screenshotExists(slug: string): boolean {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "testimonials",
      `${slug}.png`
    );
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

export function Testimonials() {
  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-3 max-w-[1040px] mx-auto">
      {TESTIMONIALS.map((t) => (
        <TestimonialCard key={t.slug} t={t} />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const hasScreenshot = screenshotExists(t.slug);

  if (hasScreenshot) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-2 overflow-hidden">
        <Image
          src={`/testimonials/${t.slug}.png`}
          alt={`Avis TikTok de ${t.username}`}
          width={600}
          height={800}
          className="w-full h-auto rounded-xl"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
    );
  }

  // Editorial fallback : quote-first card
  return (
    <figure className="rounded-2xl border border-neutral-200 bg-white p-7 sm:p-8 flex flex-col h-full">
      <span
        className="font-serif text-5xl leading-none text-neutral-300 select-none"
        aria-hidden
      >
        &ldquo;
      </span>
      <blockquote className="mt-2 font-serif text-lg sm:text-xl leading-relaxed text-neutral-900 flex-1">
        {t.comment}
      </blockquote>
      <figcaption className="mt-8 pt-5 border-t border-neutral-200 flex items-center justify-between text-xs">
        <div>
          <p className="font-semibold text-neutral-900">{t.username}</p>
          <p className="mt-0.5 text-neutral-500">{t.date}</p>
        </div>
        <div className="text-neutral-400">
          {t.likes} ♥ sur TikTok
        </div>
      </figcaption>
    </figure>
  );
}
