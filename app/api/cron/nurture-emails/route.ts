import { NextResponse } from "next/server";
import { and, eq, lte, isNotNull } from "drizzle-orm";

import db from "@/db/drizzle";
import { funnelLead, coursePurchase } from "@/db/schema";
import { getLeadMagnetContent } from "@/lib/lead-magnet-content";
import { sendNurtureEmail } from "@/lib/email/send-lead-emails";
import { ensureLeadTable } from "@/actions/lead-magnet";

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;
const BATCH = 200;

/**
 * Daily drip: sends the next nurture email to leads whose `nurtureNextAt` is due
 * and who haven't purchased. Leads who bought (course_purchase by email) are
 * stopped. Idempotent per lead because each send advances `nurtureStep` and
 * reschedules (or clears) `nurtureNextAt`.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureLeadTable();
  } catch (e) {
    console.error("[cron/nurture] ensure table failed:", e);
  }

  const content = await getLeadMagnetContent();
  const steps = content.nurture;
  const now = new Date();

  let sent = 0;
  let stopped = 0;
  let finished = 0;

  try {
    const due = await db
      .select()
      .from(funnelLead)
      .where(
        and(
          isNotNull(funnelLead.nurtureNextAt),
          lte(funnelLead.nurtureNextAt, now),
          eq(funnelLead.unsubscribed, false),
        ),
      )
      .limit(BATCH);

    for (const lead of due) {
      const step = lead.nurtureStep ?? 0;

      // No more steps configured → stop this lead.
      if (step >= steps.length) {
        await db
          .update(funnelLead)
          .set({ nurtureNextAt: null, updatedAt: new Date() })
          .where(eq(funnelLead.id, lead.id));
        finished++;
        continue;
      }

      // Already a customer → stop nurturing.
      const purchased = await db.query.coursePurchase.findFirst({
        where: eq(coursePurchase.email, lead.email),
      });
      if (purchased) {
        await db
          .update(funnelLead)
          .set({ nurtureNextAt: null, updatedAt: new Date() })
          .where(eq(funnelLead.id, lead.id));
        stopped++;
        continue;
      }

      const current = steps[step];
      const res = await sendNurtureEmail(
        lead.email,
        { subject: current.subject, bodyHtml: current.bodyHtml },
        content,
      );

      const nextStep = step + 1;
      const nextAt =
        nextStep < steps.length
          ? new Date(Date.now() + (steps[nextStep].delayDays ?? 2) * DAY_MS)
          : null;

      // Advance even if the send failed, so one bad address can't wedge the loop.
      await db
        .update(funnelLead)
        .set({ nurtureStep: nextStep, nurtureNextAt: nextAt, updatedAt: new Date() })
        .where(eq(funnelLead.id, lead.id));

      if (res.ok) sent++;
    }
  } catch (e) {
    console.error("[cron/nurture] run failed:", e);
    return NextResponse.json({ error: "run failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent, stopped, finished });
}
