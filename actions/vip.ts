"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { appSetting, analyticsEvent, userSubscription } from "@/db/schema";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  VIP_SETTINGS_KEY,
  VIP_DEFAULTS,
  getVipSettings,
  vipCustomerId,
  cleanDriveUrl,
  type VipSettings,
} from "@/lib/vip";

const LIFETIME_END = new Date("2099-12-31T23:59:59Z");

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/** Grants lifetime premium to a user id (idempotent). */
async function grantLifetime(userId: string) {
  await db
    .insert(userSubscription)
    .values({
      userId,
      stripeCustomerId: vipCustomerId(userId),
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: LIFETIME_END,
      isLifetime: true,
    })
    .onConflictDoUpdate({
      target: userSubscription.userId,
      // Keep an existing (real) Stripe customer id; just ensure lifetime access.
      set: { stripeCurrentPeriodEnd: LIFETIME_END, isLifetime: true },
    });
}

/** Best-effort lookup of an existing auth user id by email (paginated scan). */
async function findUserIdByEmail(email: string): Promise<string | null> {
  const supabase = admin();
  const target = email.toLowerCase();
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data) return null;
    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found) return found.id;
    if (data.users.length < 1000) break;
  }
  return null;
}

/**
 * Redeems a VIP access link: validates the secret code, creates (or upgrades)
 * the account, grants lifetime premium, and returns the dedicated Drive links.
 * The account is auto-confirmed so the buyer can sign in immediately.
 */
export async function redeemVipAccess(input: {
  email: string;
  password: string;
  name: string;
  code: string;
}) {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;
  const name = input.name?.trim();
  const code = input.code?.trim();

  if (!email || !password || !name) {
    return { error: "E-mail, prénom et mot de passe sont requis." } as const;
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit faire au moins 6 caractères." } as const;
  }

  const settings = await getVipSettings();
  if (!code || code.toLowerCase() !== settings.code.toLowerCase()) {
    return { error: "Lien invalide ou expiré." } as const;
  }

  const supabase = admin();
  let userId: string | null = null;
  let existed = false;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      // Returning user: upgrade their existing account to premium.
      existed = true;
      userId = await findUserIdByEmail(email);
      if (!userId) {
        return {
          error:
            "Un compte existe déjà avec cet e-mail. Connecte-toi, puis recharge cette page pour activer ton accès.",
        } as const;
      }
    } else {
      return { error: error.message } as const;
    }
  } else {
    userId = data.user.id;
  }

  try {
    await grantLifetime(userId);
  } catch (e: any) {
    console.error("[vip] grantLifetime failed:", e);
    return { error: "Compte créé mais l'activation premium a échoué. Contacte le support." } as const;
  }

  // Trace the redemption so the owner can cross-check emails vs the buyer list.
  try {
    await db.insert(analyticsEvent).values({
      event: "vip_redeem",
      path: "/acces-vip",
      meta: JSON.stringify({ email, name, existed }),
    });
  } catch {
    // Non-fatal.
  }

  const driveLinks = settings.driveLinks.map((l) => ({
    label: l.label,
    url: cleanDriveUrl(l.url),
  }));

  return { ok: true, existed, driveLinks } as const;
}

/* ---------- Admin ---------- */

function sanitize(input: VipSettings): VipSettings {
  const s = (v: unknown, fb = "") => (typeof v === "string" ? v : fb);
  return {
    code: s(input.code, VIP_DEFAULTS.code).trim() || VIP_DEFAULTS.code,
    intro: s(input.intro, VIP_DEFAULTS.intro),
    driveLinks: (Array.isArray(input.driveLinks) ? input.driveLinks : [])
      .map((l) => ({ label: s(l?.label).trim(), url: s(l?.url).trim() }))
      .filter((l) => l.url.length > 0)
      .slice(0, 20),
  };
}

/** Persists the VIP settings (admin-guarded). */
export async function updateVipSettings(input: VipSettings) {
  if (!isAdminAuthed()) throw new Error("Unauthorized");

  const clean = sanitize(input);
  try {
    await db
      .insert(appSetting)
      .values({ key: VIP_SETTINGS_KEY, value: JSON.stringify(clean), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSetting.key,
        set: { value: JSON.stringify(clean), updatedAt: new Date() },
      });
  } catch (e: any) {
    console.error("[vip] update failed:", e);
    return { error: "Échec de l'enregistrement." };
  }

  revalidatePath("/admin/premium");
  revalidatePath("/acces-vip");
  return { ok: true };
}
