import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import db from "@/db/drizzle";

/**
 * GET /api/admin/db-setup?token=ADMIN_TOKEN
 *
 * One-shot helper to create the admin-editable settings table without
 * running `db:push`. Idempotent (CREATE TABLE IF NOT EXISTS). Hit it once
 * from the browser after deploy, then save settings from /admin/premium.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    return NextResponse.json({ error: "ADMIN_TOKEN not set" }, { status: 500 });
  }
  if (token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "app_setting" (
        "key" text PRIMARY KEY,
        "value" text NOT NULL,
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    // Standalone video course support: a product_type marker on purchases and
    // a table of video lessons. Both idempotent.
    await db.execute(sql`
      ALTER TABLE "course_purchase"
      ADD COLUMN IF NOT EXISTS "product_type" text NOT NULL DEFAULT 'app';
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "course_video" (
        "id" serial PRIMARY KEY,
        "slug" text NOT NULL DEFAULT 'arabic_course',
        "title" text NOT NULL,
        "position" integer NOT NULL DEFAULT 0,
        "storage_path" text NOT NULL DEFAULT '',
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);
    await db.execute(sql`
      ALTER TABLE "course_video"
      ALTER COLUMN "storage_path" SET DEFAULT '';
    `);
    await db.execute(sql`
      ALTER TABLE "course_video"
      ADD COLUMN IF NOT EXISTS "external_url" text;
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "course_video_slug" ON "course_video" ("slug");
    `);

    return NextResponse.json({
      ok: true,
      message:
        "Tables prêtes (app_setting, course_video + colonne product_type). Tu peux gérer l'offre, le contenu et les vidéos depuis /admin/premium.",
    });
  } catch (e: any) {
    console.error("[db-setup] failed:", e);
    return NextResponse.json(
      { error: e?.message || String(e) },
      { status: 500 },
    );
  }
}
