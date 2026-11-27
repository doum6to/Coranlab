import { NextResponse } from "next/server";

import { runDailyReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Once a day, in the evening: reminds learners who have not done their lesson (see lib/reminders.ts). */
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ ok: true, ...(await runDailyReminders()) });
  } catch (e) {
    console.error("[cron/reminders] failed:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
