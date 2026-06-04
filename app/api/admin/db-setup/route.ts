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
    return NextResponse.json({
      ok: true,
      message:
        "Table app_setting prête. Tu peux maintenant enregistrer les réglages depuis /admin/premium.",
    });
  } catch (e: any) {
    console.error("[db-setup] failed:", e);
    return NextResponse.json(
      { error: e?.message || String(e) },
      { status: 500 },
    );
  }
}
