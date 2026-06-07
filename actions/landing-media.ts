"use server";

import crypto from "crypto";

import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { LANDING_MEDIA_BUCKET } from "@/lib/course-videos";

/** Creates the public landing-media bucket if missing. Idempotent. */
async function ensureBucket(supabase: ReturnType<typeof createAdminClient>) {
  const { error } = await supabase.storage.createBucket(LANDING_MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: 500 * 1024 * 1024,
    allowedMimeTypes: [
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
    ],
  });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Création du bucket impossible : ${error.message}`);
  }
}

/**
 * One-time signed upload URL so an admin can upload a (large) landing video
 * DIRECTLY to a PUBLIC Supabase bucket — bypassing the Vercel ~4.5 MB body
 * limit. Returns the future public URL to store in the landing content.
 */
export async function createLandingVideoUploadUrl(ext: string) {
  if (!isAdminAuthed()) return { error: "Unauthorized" } as const;

  const safeExt = (ext || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const path = `lire-larabe/${crypto.randomUUID()}.${safeExt}`;

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
