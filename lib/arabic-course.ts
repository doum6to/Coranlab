import "server-only";
import { and, asc, eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { coursePurchase, courseVideo } from "@/db/schema";
import { currentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { COURSE_VIDEO_BUCKET, ARABIC_COURSE_SLUG as COURSE_SLUG } from "@/lib/course-videos";
import { isEmbedUrl } from "@/lib/video-embed";
const SIGNED_URL_TTL = 60 * 60 * 4; // 4 hours

/**
 * True if the currently logged-in user bought the standalone arabic course.
 * Matched by the email used at Stripe checkout (same email = same person).
 */
export async function userHasArabicCourse(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  if (!email) return false;

  try {
    const purchase = await db.query.coursePurchase.findFirst({
      where: and(
        eq(coursePurchase.email, email),
        eq(coursePurchase.productType, COURSE_SLUG),
      ),
    });
    return !!purchase;
  } catch (e) {
    // product_type column not added yet (db-setup not run) — no access.
    console.error("[arabic-course] userHasArabicCourse failed:", e);
    return false;
  }
}

export type ArabicCourseVideo = {
  id: number;
  title: string;
  position: number;
  url: string | null;
  /** "embed" → render in an iframe (YouTube/Vimeo); "file" → <video>. */
  kind: "embed" | "file";
};

/**
 * Returns the course videos ready to play. Uploaded files get a short-lived
 * signed URL; external links are passed through. Intended to be called only
 * after `userHasArabicCourse()` has confirmed access.
 */
export async function getArabicCourseVideos(): Promise<ArabicCourseVideo[]> {
  let rows;
  try {
    rows = await db.query.courseVideo.findMany({
      where: eq(courseVideo.slug, COURSE_SLUG),
      orderBy: [asc(courseVideo.position), asc(courseVideo.id)],
    });
  } catch (e) {
    console.error("[arabic-course] getArabicCourseVideos failed:", e);
    return [];
  }
  if (!rows.length) return [];

  // Sign only the uploaded files (rows with a storage path).
  const storedPaths = rows
    .filter((r) => r.storagePath && !r.externalUrl)
    .map((r) => r.storagePath);
  const urlByPath = new Map<string, string>();
  if (storedPaths.length) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(COURSE_VIDEO_BUCKET)
      .createSignedUrls(storedPaths, SIGNED_URL_TTL);
    if (!error && data) {
      data.forEach((d, i) => {
        if (d.signedUrl) urlByPath.set(storedPaths[i], d.signedUrl);
      });
    }
  }

  return rows.map((r) => {
    if (r.externalUrl) {
      return {
        id: r.id,
        title: r.title,
        position: r.position,
        url: r.externalUrl,
        kind: isEmbedUrl(r.externalUrl) ? "embed" : "file",
      };
    }
    return {
      id: r.id,
      title: r.title,
      position: r.position,
      url: urlByPath.get(r.storagePath) ?? null,
      kind: "file",
    };
  });
}
