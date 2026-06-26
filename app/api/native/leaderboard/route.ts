import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { leagues, weeklyXp, userProgress } from "@/db/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWeekStart, LEAGUE_TIERS, TIER_LABELS } from "@/lib/league-utils";

/**
 * Native iOS endpoint: returns the authenticated user's league standings for
 * the current week (or the tier ladder if not yet joined). Token-auth only,
 * self-contained (no cookie-coupled web queries), so the website is unaffected.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authz = req.headers.get("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: userData, error } = await supabase.auth.getUser(token);
  if (error || !userData?.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const userId = userData.user.id;
  const weekStart = getCurrentWeekStart();

  const tiers = LEAGUE_TIERS.map((t) => ({ tier: t, label: TIER_LABELS[t] }));

  const me = await db.query.leagues.findFirst({
    where: and(eq(leagues.userId, userId), eq(leagues.weekStart, weekStart)),
  });
  if (!me || me.groupId === "PENDING") {
    return NextResponse.json({ joined: false, tiers });
  }

  const members = await db.select().from(leagues).where(eq(leagues.groupId, me.groupId));
  const xpRows = await db.select().from(weeklyXp).where(eq(weeklyXp.weekStart, weekStart));
  const xpMap = new Map<string, number>();
  for (const r of xpRows) xpMap.set(r.userId, r.xp);

  const realIds = members.filter((m) => !m.isBot).map((m) => m.userId);
  const names = new Map<string, { name: string; imageSrc: string }>();
  if (realIds.length > 0) {
    const us = await db.query.userProgress.findMany({
      columns: { userId: true, userName: true, userImageSrc: true },
    });
    for (const u of us) {
      if (realIds.includes(u.userId)) {
        names.set(u.userId, { name: u.userName, imageSrc: u.userImageSrc ?? "" });
      }
    }
  }

  const out = members.map((m) => ({
    userId: m.userId,
    name: m.isBot ? (m.botName ?? "Joueur") : (names.get(m.userId)?.name ?? "Joueur"),
    weeklyXp: xpMap.get(m.userId) ?? 0,
    isCurrentUser: m.userId === userId,
  }));
  out.sort((a, b) => b.weeklyXp - a.weeklyXp);
  const ranked = out.map((m, i) => ({ ...m, rank: i + 1 }));

  return NextResponse.json({
    joined: true,
    tier: me.tier,
    tierLabel: TIER_LABELS[me.tier],
    members: ranked,
  });
}
