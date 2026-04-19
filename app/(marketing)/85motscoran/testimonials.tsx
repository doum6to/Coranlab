import fs from "fs";
import path from "path";

import Image from "next/image";
import { Heart } from "lucide-react";

/**
 * Real TikTok review screenshots + text-fallback cards.
 *
 * Each testimonial has:
 *   - `screenshot`: path relative to `/public`. If the file exists in
 *     `public/testimonials/`, the component renders it as an image.
 *   - Otherwise, it renders a styled text card (TikTok-comment look).
 *
 * Detection runs at RENDER time (server component, fs.existsSync). Because
 * `/85motscoran` is `force-static`, this runs at build → images are auto-
 * detected once the user uploads them and redeploys.
 */

type Testimonial = {
  /** Slug used as filename (e.g. "moisix" → /public/testimonials/moisix.png) */
  slug: string;
  username: string;
  date: string;
  comment: string;
  likes: number;
  avatarColor: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    // Moisix._ — 90 likes, strongest social proof, shown first
    slug: "moisix",
    username: "Moisix._",
    date: "30 avr. 2025",
    comment:
      "Honnêtement, je ne m'attendais pas à une telle qualité pour ce prix ! C'est une excellente surprise et je recommande ce produit à 100%.",
    likes: 90,
    avatarColor: "bg-red-100 text-red-600",
  },
  {
    slug: "nora-ecom",
    username: "Nora Ecom",
    date: "18 avr. 2026",
    comment:
      "Allahu akbar ! Je suis venue voir les avis, je ne suis pas déçue. Qu'Allah vous récompense et par contre je suis choquée de bcp de gens de la Oummah qui veulent tout gratuit mais qui n'y toucheraient même pas si c'était le cas 😳",
    likes: 1,
    avatarColor: "bg-orange-100 text-orange-600",
  },
  {
    slug: "azzedine",
    username: "Azzedine",
    date: "9 juil. 2025",
    comment:
      "je viens de l'acheter, il a l'air très complet qu'allah vous récompense !",
    likes: 2,
    avatarColor: "bg-indigo-100 text-indigo-600",
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
    <div className="grid gap-5 md:grid-cols-3 max-w-[1040px] mx-auto">
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
      <div className="rounded-2xl border-2 border-b-4 border-brilliant-border bg-white p-3 sm:p-4 overflow-hidden">
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

  // Text-only fallback styled like a TikTok comment
  const initial = t.username.replace(/^[.\-_]+/, "").charAt(0).toUpperCase();
  return (
    <div className="rounded-2xl border-2 border-b-4 border-brilliant-border bg-white p-5 sm:p-6 flex flex-col">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${t.avatarColor}`}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold font-heading text-brilliant-text truncate">
            {t.username}
          </p>
          <p className="text-xs text-brilliant-muted">{t.date}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-brilliant-text leading-relaxed flex-1">
        {t.comment}
      </p>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-brilliant-muted">
        <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
        <span className="font-semibold">{t.likes}</span>
        <span>·</span>
        <span className="italic">Commentaire TikTok</span>
      </div>
    </div>
  );
}
