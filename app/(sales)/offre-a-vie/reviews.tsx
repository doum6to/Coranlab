import { Testimonials } from "../85motscoran/testimonials";
import { ReviewsMarquee } from "./reviews-marquee";
import { TextReviewsMarquee } from "./text-reviews-marquee";
import type { LandingReview } from "@/lib/landing-content";

/**
 * Reviews block. Admin-added content drives a two-row infinite marquee — image
 * reviews and/or text reviews, each on its own carousel. As soon as the admin
 * adds any review, it replaces the hardcoded testimonials. With nothing set, we
 * fall back to the shared hardcoded testimonials.
 */
export function LandingReviews({
  items,
  screenshots = [],
}: {
  items: LandingReview[];
  screenshots?: string[];
}) {
  const hasImages = screenshots.length > 0;
  const hasItems = items.length > 0;

  if (!hasImages && !hasItems) {
    return <Testimonials />;
  }

  return (
    <div className="space-y-4">
      {hasImages && <ReviewsMarquee images={screenshots} />}
      {hasItems && <TextReviewsMarquee reviews={items} />}
    </div>
  );
}
