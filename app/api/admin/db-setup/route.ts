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

    // Visitor-behavior analytics events (admin dashboard).
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "analytics_event" (
        "id" serial PRIMARY KEY,
        "event" text NOT NULL,
        "path" text,
        "locale" text,
        "session_id" text,
        "meta" text,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "analytics_event_event" ON "analytics_event" ("event");
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "analytics_event_created" ON "analytics_event" ("created_at");
    `);

    // Funnel (V5) leads: first name + email captured before payment, plus the
    // personalization choice and furthest step reached.
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "funnel_lead" (
        "id" serial PRIMARY KEY,
        "email" text NOT NULL,
        "first_name" text,
        "locale" text,
        "focus_choice" text,
        "reached_exercise" boolean NOT NULL DEFAULT false,
        "reached_offer" boolean NOT NULL DEFAULT false,
        "started_checkout" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);
    // In case the table already existed (older db:push) without this column.
    await db.execute(sql`
      ALTER TABLE "funnel_lead" ADD COLUMN IF NOT EXISTS "focus_choice" text;
    `);
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "funnel_lead_email" ON "funnel_lead" ("email");
    `);

    return NextResponse.json({
      ok: true,
      message:
        "Tables prêtes (app_setting, course_video, analytics_event, funnel_lead). Tu peux gérer l'offre, le contenu, les vidéos et voir les leads du tunnel depuis /admin/premium.",
    });
  } catch (e: any) {
    console.error("[db-setup] failed:", e);
    return NextResponse.json(
      { error: e?.message || String(e) },
      { status: 500 },
    );
  }
}
