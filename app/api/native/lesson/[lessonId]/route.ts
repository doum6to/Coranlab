import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { challenges } from "@/db/schema";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Native iOS endpoint: returns a lesson's challenges + options for play.
 * Auth via Supabase Bearer token. Self-contained (doesn't touch web queries).
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Auth is OPTIONAL: lesson content (challenges) is not user-specific, so
  // guests can play the free lessons without registering (App Store 5.1.1(v)).
  // If a token is provided it must be valid; saving progress still requires
  // auth via the separate lesson-complete endpoint.
  const authz = req.headers.get("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
  if (token) {
    const supabase = createAdminClient();
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  // lessonId is the last path segment: /api/native/lesson/<id>
  const segments = new URL(req.url).pathname.split("/").filter(Boolean);
  const lessonId = Number(segments[segments.length - 1]);
  if (!Number.isFinite(lessonId)) {
    return NextResponse.json({ error: "Bad lesson id" }, { status: 400 });
  }

  const rows = await db.query.challenges.findMany({
    where: eq(challenges.lessonId, lessonId),
    orderBy: (challenges, { asc }) => [asc(challenges.order)],
    columns: {
      id: true,
      type: true,
      question: true,
      order: true,
      arabicWord: true,
      frenchTranslation: true,
    },
    with: {
      challengeOptions: {
        columns: {
          id: true,
          text: true,
          correct: true,
          imageSrc: true,
          audioSrc: true,
          arabicText: true,
          frenchText: true,
          pairIndex: true,
        },
      },
    },
  });

  const challengesOut = rows.map((c) => ({
    id: c.id,
    type: c.type,
    question: c.question,
    order: c.order,
    arabicWord: c.arabicWord,
    frenchTranslation: c.frenchTranslation,
    options: c.challengeOptions.map((o) => ({
      id: o.id,
      text: o.text,
      correct: o.correct,
      imageSrc: o.imageSrc,
      audioSrc: o.audioSrc,
      arabicText: o.arabicText,
      frenchText: o.frenchText,
      pairIndex: o.pairIndex,
    })),
  }));

  return NextResponse.json({ lessonId, challenges: challengesOut });
}
