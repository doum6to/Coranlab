import { redirect } from "next/navigation";

import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { adminConfigured, isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOfferSettings } from "@/lib/offer";

import { UsersTable, type AdminUser } from "./users-table";
import { OfferSettingsForm } from "./offer-settings-form";

export const dynamic = "force-dynamic";

const DAY_IN_MS = 86_400_000;
const MAX_USERS = 5000;

const computeIsActive = (sub: typeof userSubscription.$inferSelect) => {
  if (sub.isLifetime) return true;
  const end = sub.stripeCurrentPeriodEnd?.getTime();
  return (
    typeof end === "number" && !Number.isNaN(end) && end + DAY_IN_MS > Date.now()
  );
};

const AdminPremiumPage = async () => {
  if (!adminConfigured()) {
    return (
      <div className="mx-auto max-w-xl p-10">
        <h1 className="mb-2 text-2xl font-bold text-neutral-800">
          Portail admin non configuré
        </h1>
        <p className="text-neutral-600">
          Définissez les variables d&apos;environnement{" "}
          <code className="rounded bg-neutral-200 px-1">ADMIN_USERNAME</code> et{" "}
          <code className="rounded bg-neutral-200 px-1">ADMIN_PASSWORD</code>{" "}
          sur Vercel, puis redéployez.
        </p>
      </div>
    );
  }

  if (!isAdminAuthed()) {
    redirect("/admin/premium/login");
  }

  // 1. All subscription rows, keyed by userId.
  const subs = await db.select().from(userSubscription);
  const subByUser = new Map(subs.map((s) => [s.userId, s]));

  // 2. All Supabase auth users (paginated).
  const supabase = createAdminClient();
  const authUsers: Array<{
    id: string;
    email?: string;
    created_at?: string;
    user_metadata?: Record<string, unknown>;
  }> = [];
  let page = 1;
  const perPage = 1000;
  while (authUsers.length < MAX_USERS) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) break;
    authUsers.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }

  // 3. Merge into a serializable shape for the client table.
  const users: AdminUser[] = authUsers.map((u) => {
    const sub = subByUser.get(u.id);
    const isPremium = sub ? computeIsActive(sub) : false;
    const isManual = !!sub?.stripeCustomerId?.startsWith("manual_");

    let plan = "Gratuit";
    if (isPremium) {
      if (sub?.isLifetime) plan = isManual ? "Manuel (admin)" : "À vie";
      else plan = "Abonné";
    }

    return {
      id: u.id,
      email: u.email || "—",
      name:
        (u.user_metadata?.full_name as string) ||
        u.email?.split("@")[0] ||
        "—",
      createdAt: u.created_at || null,
      isPremium,
      plan,
      source: sub ? (isManual ? "Admin" : "Stripe") : "—",
      periodEnd:
        sub && !sub.isLifetime
          ? sub.stripeCurrentPeriodEnd?.toISOString() || null
          : null,
    };
  });

  // Newest accounts first.
  users.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  const premiumCount = users.filter((u) => u.isPremium).length;

  const offer = await getOfferSettings();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <OfferSettingsForm
          initial={{
            priceEuros: (offer.priceCents / 100).toFixed(2),
            spotsJoined: offer.spotsJoined,
            spotsTotal: offer.spotsTotal,
          }}
        />
        <UsersTable
          users={users}
          premiumCount={premiumCount}
          freeCount={users.length - premiumCount}
        />
      </div>
    </div>
  );
};

export default AdminPremiumPage;
