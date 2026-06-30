import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import {
  challengeProgress,
  streakActivity,
  weeklyXp,
  userSubscription,
  userProgress,
} from "@/db/schema";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Native iOS endpoint: permanently deletes the authenticated user's account and
 * all associated data (App Store Review guideline 5.1.1(v) — account deletion).
 * Auth via Supabase Bearer token. Self-contained; does not touch web code.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authz = req.headers.get("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const userId = userData.user.id;

  // 1. Delete the user's app data.
  try {
    await db.delete(challengeProgress).where(eq(challengeProgress.userId, userId));
    await db.delete(streakActivity).where(eq(streakActivity.userId, userId));
    await db.delete(weeklyXp).where(eq(weeklyXp.userId, userId));
    await db.delete(userSubscription).where(eq(userSubscription.userId, userId));
    await db.delete(userProgress).where(eq(userProgress.userId, userId));
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete user data" }, { status: 500 });
  }

  // 2. Delete the Supabase auth user.
  const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
  if (delErr) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
