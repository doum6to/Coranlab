"use server";

import crypto from "crypto";
import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { courseVideo } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { COURSE_VIDEO_BUCKET, ARABIC_COURSE_SLUG as COURSE_SLUG } from "@/lib/course-videos";

/** Creates the private bucket if it doesn't exist yet. Idempotent. */
async function ensureBucket(supabase: ReturnType<typeof createAdminClient>) {
  const { error } = await supabase.storage.createBucket(COURSE_VIDEO_BUCKET, {
    public: false,
    // 2 GB ceiling per file — generous for a lesson video.
    fileSizeLimit: 2 * 1024 * 1024 * 1024,
    allowedMimeTypes: [
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-matroska",
    ],
  });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Création du bucket impossible : ${error.message}`);
  }
}

/**
 * Returns a one-time signed upload URL so the admin's browser can upload the
 * (large) video file DIRECTLY to Supabase Storage — bypassing the Vercel
 * ~4.5 MB serverless body limit entirely.
 */
export async function createVideoUploadUrl(ext: string) {
  if (!isAdminAuthed()) return { error: "Unauthorized" } as const;

  const safeExt = (ext || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const path = `${COURSE_SLUG}/${crypto.randomUUID()}.${safeExt}`;

  try {
    const supabase = createAdminClient();
    await ensureBucket(supabase);

    const { data, error } = await supabase.storage
      .from(COURSE_VIDEO_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return { error: error?.message || "Impossible de créer l'URL d'upload." } as const;
    }

    return { path: data.path, token: data.token } as const;
  } catch (e: any) {
    console.error("[course-videos] createVideoUploadUrl failed:", e);
    return { error: e?.message || "Erreur inconnue." } as const;
  }
}

/** Persists a video row once its file is uploaded. Position auto-increments. */
export async function saveCourseVideo(input: {
  title: string;
  storagePath: string;
  position?: number;
}) {
  if (!isAdminAuthed()) return { error: "Unauthorized" } as const;

  const title = input.title?.trim();
  const storagePath = input.storagePath?.trim();
  if (!title || !storagePath) {
    return { error: "Titre et fichier requis." } as const;
  }

  try {
    let position = input.position;
    if (typeof position !== "number" || Number.isNaN(position)) {
      const [{ max }] = await db
        .select({ max: sql<number>`coalesce(max(${courseVideo.position}), 0)` })
        .from(courseVideo)
        .where(eq(courseVideo.slug, COURSE_SLUG));
      position = (max ?? 0) + 1;
    }

    await db.insert(courseVideo).values({
      slug: COURSE_SLUG,
      title,
      storagePath,
      position,
    });

    revalidatePath("/admin/premium");
    revalidatePath("/ma-formation");
    return { ok: true } as const;
  } catch (e: any) {
    console.error("[course-videos] saveCourseVideo failed:", e);
    return { error: e?.message || "Erreur lors de l'enregistrement." } as const;
  }
}

/** Updates a video's title and position. */
export async function updateCourseVideo(input: {
  id: number;
  title: string;
  position: number;
}) {
  if (!isAdminAuthed()) return { error: "Unauthorized" } as const;
  const title = input.title?.trim();
  if (!title) return { error: "Titre requis." } as const;

  try {
    await db
      .update(courseVideo)
      .set({ title, position: input.position })
      .where(eq(courseVideo.id, input.id));
    revalidatePath("/admin/premium");
    revalidatePath("/ma-formation");
    return { ok: true } as const;
  } catch (e: any) {
    console.error("[course-videos] updateCourseVideo failed:", e);
    return { error: e?.message || "Erreur." } as const;
  }
}

/** Deletes a video row and its file in storage. */
export async function deleteCourseVideo(id: number) {
  if (!isAdminAuthed()) return { error: "Unauthorized" } as const;

  try {
    const row = await db.query.courseVideo.findFirst({
      where: eq(courseVideo.id, id),
    });
    if (!row) return { error: "Vidéo introuvable." } as const;

    const supabase = createAdminClient();
    await supabase.storage.from(COURSE_VIDEO_BUCKET).remove([row.storagePath]);
    await db.delete(courseVideo).where(eq(courseVideo.id, id));

    revalidatePath("/admin/premium");
    revalidatePath("/ma-formation");
    return { ok: true } as const;
  } catch (e: any) {
    console.error("[course-videos] deleteCourseVideo failed:", e);
    return { error: e?.message || "Erreur lors de la suppression." } as const;
  }
}

/** Admin listing of all videos for the course (ordered). */
export async function listCourseVideos() {
  if (!isAdminAuthed()) return [];
  try {
    return await db.query.courseVideo.findMany({
      where: eq(courseVideo.slug, COURSE_SLUG),
      orderBy: [asc(courseVideo.position), asc(courseVideo.id)],
    });
  } catch (e) {
    // Table not created yet (db-setup not run) — degrade gracefully.
    console.error("[course-videos] listCourseVideos failed:", e);
    return [];
  }
}
