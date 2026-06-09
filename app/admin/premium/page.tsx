import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { coursePurchase, userSubscription } from "@/db/schema";
import { adminConfigured, isAdminAuthed } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOfferSettings } from "@/lib/offer";
import { getLandingContent } from "@/lib/landing-content";
import { getArabicLandingContent } from "@/lib/arabic-landing-content";

import { listCourseVideos } from "@/actions/course-videos";

import { UsersTable, type AdminUser } from "./users-table";
import { OfferSettingsForm } from "./offer-settings-form";
import { LandingContentForm } from "./landing-content-form";
import { ArabicLandingForm } from "./arabic-landing-form";
import { VideosForm } from "./videos-form";
import { AnalyticsPanel } from "./analytics-panel";
import { AdminTabs } from "./admin-tabs";

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

  // 1b. Emails that have access to the standalone arabic course (matched by
  // email). Resilient: empty set if the product_type column doesn't exist yet.
  const arabicEmails = new Set<string>();
  try {
    const rows = await db
      .select({ email: coursePurchase.email })
      .from(coursePurchase)
      .where(eq(coursePurchase.productType, "arabic_course"));
    rows.forEach((r) => arabicEmails.add(r.email.toLowerCase()));
  } catch (e) {
    console.error("[admin] arabic course emails query failed:", e);
  }

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
      hasArabicCourse: u.email
        ? arabicEmails.has(u.email.toLowerCase())
        : false,
    };
  });

  // Newest accounts first.
  users.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  const premiumCount = users.filter((u) => u.isPremium).length;

  const [
    offer,
    contentFr,
    contentEn,
    contentEs,
    contentV4Fr,
    contentV4En,
    contentV4Es,
    arabicContent,
    videos,
  ] = await Promise.all([
    getOfferSettings(),
    getLandingContent("fr"),
    getLandingContent("en"),
    getLandingContent("es"),
    getLandingContent("fr", "v4"),
    getLandingContent("en", "v4"),
    getLandingContent("es", "v4"),
    getArabicLandingContent(),
    listCourseVideos(),
  ]);
  const landingByVariant = {
    v3: { fr: contentFr, en: contentEn, es: contentEs },
    v4: { fr: contentV4Fr, en: contentV4En, es: contentV4Es },
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <header className="mb-6">
          <h1 className="font-bold text-2xl text-neutral-900">
            Dashboard Quranlab
          </h1>
          <p className="text-sm text-neutral-500">
            Gère l&apos;offre, le contenu de la landing et les accès premium.
          </p>
        </header>

        <AdminTabs
          tabs={[
            {
              key: "offer",
              label: "Offre & prix",
              node: (
                <OfferSettingsForm
                  initial={{
                    priceEuros: (offer.priceCents / 100).toFixed(2),
                    compareEuros: (offer.compareAtCents / 100).toFixed(2),
                    spotsJoined: offer.spotsJoined,
                    spotsTotal: offer.spotsTotal,
                    variant: offer.variant,
                    pdfRaw: offer.pdfLinks
                      .map((l) => `${l.label} | ${l.url}`)
                      .join("\n"),
                    pricingByLocale: Object.fromEntries(
                      (["fr", "en", "es"] as const).map((loc) => {
                        const p = offer.pricingByLocale[loc];
                        return [
                          loc,
                          {
                            currency: p.currency,
                            price: (p.priceCents / 100).toFixed(2),
                            compare: (p.compareAtCents / 100).toFixed(2),
                          },
                        ];
                      }),
                    ) as Record<
                      "fr" | "en" | "es",
                      { currency: "EUR" | "GBP" | "USD"; price: string; compare: string }
                    >,
                    pricingByLocaleV4: Object.fromEntries(
                      (["fr", "en", "es"] as const).map((loc) => {
                        const p = offer.pricingByLocaleV4[loc];
                        return [
                          loc,
                          {
                            currency: p.currency,
                            price: (p.priceCents / 100).toFixed(2),
                            compare: (p.compareAtCents / 100).toFixed(2),
                          },
                        ];
                      }),
                    ) as Record<
                      "fr" | "en" | "es",
                      { currency: "EUR" | "GBP" | "USD"; price: string; compare: string }
                    >,
                    paymentBadges: offer.paymentBadges,
                  }}
                />
              ),
            },
            {
              key: "analytics",
              label: "Analytics",
              node: <AnalyticsPanel />,
            },
            {
              key: "content",
              label: "Landing /offre-a-vie",
              node: <LandingContentForm initialByVariant={landingByVariant} />,
            },
            {
              key: "arabic",
              label: "Landing /lire-larabe",
              node: <ArabicLandingForm initial={arabicContent} />,
            },
            {
              key: "videos",
              label: "Formation vidéo",
              node: (
                <VideosForm
                  initial={videos.map((v) => ({
                    id: v.id,
                    title: v.title,
                    position: v.position,
                    storagePath: v.storagePath,
                    externalUrl: v.externalUrl ?? null,
                  }))}
                />
              ),
            },
            {
              key: "users",
              label: "Premium (utilisateurs)",
              node: (
                <UsersTable
                  users={users}
                  premiumCount={premiumCount}
                  freeCount={users.length - premiumCount}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default AdminPremiumPage;
