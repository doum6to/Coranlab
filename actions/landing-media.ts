"use server";

import crypto from "crypto";

import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { LANDING_MEDIA_BUCKET } from "@/lib/course-videos";

const LANDING_MEDIA_MIME = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

/** Creates the public landing-media bucket if missing. Idempotent. */
async function ensureBucket(supabase: ReturnType<typeof createAdminClient>) {
  const { error } = await supabase.storage.createBucket(LANDING_MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: 500 * 1024 * 1024,
    allowedMimeTypes: LANDING_MEDIA_MIME,
  });
  if (!error || /already exists/i.test(error.message)) return;

  // A bucket-level fileSizeLimit can't exceed the project's GLOBAL upload limit
  // (50 MB by default on the free plan). When that's the case Supabase rejects
  // the creation with "exceeded the maximum allowed size" — so retry without an
  // explicit limit, letting the bucket inherit the project's global cap.
  if (/maximum allowed size|exceeded/i.test(error.message)) {
    const { error: retryError } = await supabase.storage.createBucket(
      LANDING_MEDIA_BUCKET,
      { public: true, allowedMimeTypes: LANDING_MEDIA_MIME },
    );
    if (!retryError || /already exists/i.test(retryError.message)) return;
    throw new Error(`Création du bucket impossible : ${retryError.message}`);
  }

  throw new Error(`Création du bucket impossible : ${error.message}`);
}

/**
 * One-time signed upload URL so an admin can upload a (large) landing video
 * DIRECTLY to a PUBLIC Supabase bucket — bypassing the Vercel ~4.5 MB body
 * limit. Returns the future public URL to store in the landing content.
 */
export async function createLandingVideoUploadUrl(ext: string, folder = "lire-larabe") {
  if (!isAdminAuthed()) return { error: "Unauthorized" } as const;

  const safeExt = (ext || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const safeFolder = (folder || "lire-larabe").toLowerCase().replace(/[^a-z0-9-]/g, "") || "lire-larabe";
  const path = `${safeFolder}/${crypto.randomUUID()}.${safeExt}`;

  try {
    const supabase = createAdminClient();
    await ensureBucket(supabase);

    const { data, error } = await supabase.storage
      .from(LANDING_MEDIA_BUCKET)
      .createSignedUploadUrl(path);
    if (error || !data) {
      return { error: error?.message || "Impossible de créer l'URL d'upload." } as const;
    }

    const { data: pub } = supabase.storage
      .from(LANDING_MEDIA_BUCKET)
      .getPublicUrl(path);

    return { path: data.path, token: data.token, publicUrl: pub.publicUrl } as const;
  } catch (e: any) {
    console.error("[landing-media] createLandingVideoUploadUrl failed:", e);
    return { error: e?.message || "Erreur inconnue." } as const;
  }
}
