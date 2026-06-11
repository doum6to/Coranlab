import crypto from "crypto";
import { NextResponse } from "next/server";

import { isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "images";

/**
 * POST /api/admin/upload  (multipart form-data, field "file")
 *
 * Uploads an image to Supabase Storage and returns its public URL. Used by
 * the landing-content editor in /admin/premium. Guarded by the admin session
 * cookie (same auth as the portal).
 */
export async function POST(req: Request) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    file = form.get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Le fichier doit être une image." },
      { status: 400 },
    );
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `coranlab/landing/${crypto.randomUUID()}.${ext}`;

  try {
    const supabase = createAdminClient();
    const contentType = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    const doUpload = () =>
      supabase.storage.from(BUCKET).upload(path, buffer, {
        contentType,
        upsert: false,
        // 1 year, immutable: each upload gets a fresh UUID path, so long
        // caching is safe and fixes the "inefficient cache TTL" audit
        // (Supabase defaults to 1h).
        cacheControl: "31536000",
      });

    let { error } = await doUpload();

    // Self-heal: if the bucket doesn't exist yet, create it (public) and retry.
    if (error && /bucket not found/i.test(error.message)) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
        public: true,
      });
      if (createErr && !/already exists/i.test(createErr.message)) {
        return NextResponse.json(
          { error: `Création du bucket impossible : ${createErr.message}` },
          { status: 500 },
        );
      }
      ({ error } = await doUpload());
    }

    if (error) {
      console.error("[upload] supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e: any) {
    console.error("[upload] failed:", e);
    return NextResponse.json(
      { error: e?.message || String(e) },
      { status: 500 },
    );
  }
}
