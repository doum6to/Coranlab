import "server-only";
import { and, asc, eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { coursePurchase, courseVideo } from "@/db/schema";
import { currentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { COURSE_VIDEO_BUCKET, ARABIC_COURSE_SLUG as COURSE_SLUG } from "@/lib/course-videos";
const SIGNED_URL_TTL = 60 * 60 * 4; // 4 hours

/**
 * True if the currently logged-in user bought the standalone arabic course.
 * Matched by the email used at Stripe checkout (same email = same person).
 */
export async function userHasArabicCourse(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  if (!email) return false;

  const purchase = await db.query.coursePurchase.findFirst({
    where: and(
      eq(coursePurchase.email, email),
      eq(coursePurchase.productType, COURSE_SLUG),
    ),
  });
  return !!purchase;
}

export type ArabicCourseVideo = {
  id: number;
  title: string;
  position: number;
  url: string | null;
};

/**
 * Returns the course videos with short-lived signed playback URLs. Intended to
 * be called only after `userHasArabicCourse()` has confirmed access.
 */
export async function getArabicCourseVideos(): Promise<ArabicCourseVideo[]> {
  const rows = await db.query.courseVideo.findMany({
    where: eq(courseVideo.slug, COURSE_SLUG),
    orderBy: [asc(courseVideo.position), asc(courseVideo.id)],
  });
  if (!rows.length) return [];

  const supabase = createAdminClient();
  const paths = rows.map((r) => r.storagePath);
  const { data, error } = await supabase.storage
    .from(COURSE_VIDEO_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL);

  const urlByPath = new Map<string, string>();
  if (!error && data) {
    data.forEach((d, i) => {
      if (d.signedUrl) urlByPath.set(paths[i], d.signedUrl);
    });
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    position: r.position,
    url: urlByPath.get(r.storagePath) ?? null,
  }));
}
