import { Testimonials } from "../85motscoran/testimonials";
import { ReviewsMarquee } from "./reviews-marquee";
import type { LandingReview } from "@/lib/landing-content";

/**
 * Reviews block. When TikTok review screenshots have been uploaded from the
 * admin, they're shown as an infinite auto-scrolling marquee (highest
 * credibility). Otherwise we fall back to the shared screenshot/quote cards
 * plus any admin-editable text reviews.
 */
export function LandingReviews({
  items,
  screenshots = [],
}: {
  items: LandingReview[];
  screenshots?: string[];
}) {
  if (screenshots.length > 0) {
    return <ReviewsMarquee images={screenshots} />;
  }

  return (
    <>
      <Testimonials />

      {items.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => (
            <div
              key={`${r.author}-${i}`}
              className="rounded-3xl border-2 border-neutral-900/10 bg-white p-6"
            >
              <p className="text-sm leading-relaxed text-neutral-700">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-display font-semibold text-neutral-900">
                  {r.author}
                </span>
                {r.handle ? (
                  <span className="text-xs text-neutral-400">{r.handle}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
