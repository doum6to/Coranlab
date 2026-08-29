"use server";

import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  APPRENDRE_CORAN_KEY,
  APPRENDRE_CORAN_DEFAULTS,
  type ApprendreCoranContent,
  type OnbStep,
  type OnbPlan,
  type OnbCol,
} from "@/lib/apprendre-coran-content";

const s = (v: unknown, fb = "") => (typeof v === "string" ? v : fb);
const list = (v: unknown, max = 12): string[] =>
  (Array.isArray(v) ? v : []).map((x) => s(x)).map((x) => x.trim()).filter(Boolean).slice(0, max);

function sanitizeCol(c: unknown, d: OnbCol): OnbCol {
  const o = (c ?? {}) as Partial<OnbCol>;
  return { title: s(o.title, d.title), good: o.good === true, items: list(o.items, 8) };
}

function sanitizePlan(p: unknown, d: OnbPlan): OnbPlan {
  const o = (p ?? {}) as Partial<OnbPlan>;
  const cents =
    typeof o.amountCents === "number" && Number.isFinite(o.amountCents) && o.amountCents > 0
      ? Math.round(o.amountCents)
      : d.amountCents;
  return {
    amountCents: cents,
    interval: o.interval === "week" || o.interval === "year" ? o.interval : d.interval,
    title: s(o.title, d.title),
    priceLabel: s(o.priceLabel, d.priceLabel),
    per: s(o.per, d.per),
    sub: s(o.sub, d.sub),
    popular: o.popular === true,
  };
}

function sanitize(input: ApprendreCoranContent): ApprendreCoranContent {
  const d = APPRENDRE_CORAN_DEFAULTS;

  const steps: OnbStep[] = (Array.isArray(input.steps) ? input.steps : [])
    .slice(0, 40)
    .map((st) => {
      const out: OnbStep = { type: st.type };
      if (st.headline !== undefined) out.headline = s(st.headline);
      if (st.sub !== undefined) out.sub = s(st.sub);
      if (st.image !== undefined) out.image = s(st.image).trim();
      if (st.cta !== undefined) out.cta = s(st.cta);
      if (st.big !== undefined) out.big = s(st.big);
      if (st.items !== undefined) out.items = list(st.items, 12);
      if (st.options !== undefined) out.options = list(st.options, 12);
      if (st.left) out.left = sanitizeCol(st.left, d.steps[3].left!);
      if (st.right) out.right = sanitizeCol(st.right, d.steps[3].right!);
      if (st.reviews !== undefined) {
        out.reviews = (Array.isArray(st.reviews) ? st.reviews : [])
          .map((r) => ({ name: s(r?.name).trim(), text: s(r?.text).trim() }))
          .filter((r) => r.text.length > 0)
          .slice(0, 20);
      }
      return out;
    });

  const p = input.paywall ?? ({} as ApprendreCoranContent["paywall"]);
  return {
    steps: steps.length ? steps : d.steps,
    paywall: {
      title: s(p.title, d.paywall.title),
      image: s(p.image).trim(),
      bullets: list(p.bullets, 6),
      weekly: sanitizePlan(p.weekly, d.paywall.weekly),
      annual: sanitizePlan(p.annual, d.paywall.annual),
      reassurance: s(p.reassurance, d.paywall.reassurance),
    },
  };
}

/** Persists the /apprendre-coran content (admin-guarded). */
export async function updateApprendreCoranContent(input: ApprendreCoranContent) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const clean = sanitize(input);
  try {
    await db
      .insert(appSetting)
      .values({ key: APPRENDRE_CORAN_KEY, value: JSON.stringify(clean), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value: JSON.stringify(clean), updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[apprendre-coran] update failed:", e);
    return { error: "Échec de l'enregistrement." };
  }

  revalidatePath("/apprendre-coran");
  revalidatePath("/admin/premium");
  return { ok: true };
}
