import "server-only";
import { cache } from "react";
import { and, eq, like } from "drizzle-orm";

import db from "@/db/drizzle";
import { coursePurchase } from "@/db/schema";
import { getUserSubscription } from "@/db/queries";
import { currentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBooksContent } from "@/lib/books-content";
import { bookProductId, bookPurchaseType, type BookSlug } from "@/lib/books-shared";

const BUCKET = "books";
const SIGNED_TTL = 60 * 60; // 1 hour

/**
 * Which books the signed-in user may read:
 *  - Premium (active or lifetime) → every book flagged includedWithPremium;
 *  - a web purchase (course_purchase.product_type = "book_<slug>" on the
 *    same email);
 *  - an iOS purchase (RevenueCat non-subscription on the user's id).
 */
export const getOwnedBookSlugs = cache(async (): Promise<Set<BookSlug>> => {
  const owned = new Set<BookSlug>();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  if (!user || !email) return owned;

  const [content, sub] = await Promise.all([getBooksContent(), getUserSubscription()]);
  const isPro = !!sub?.isActive;
  for (const b of content.books) if (b.includedWithPremium && isPro) owned.add(b.slug);

  try {
    const rows = await db
      .select({ productType: coursePurchase.productType })
      .from(coursePurchase)
      .where(and(eq(coursePurchase.email, email), like(coursePurchase.productType, "book_%")));
    for (const r of rows) {
      const slug = r.productType.replace(/^book_/, "");
      for (const b of content.books) if (b.slug === slug) owned.add(b.slug);
    }
  } catch (e) {
    console.error("[books] purchase lookup failed:", e);
  }

  // iOS purchases (RevenueCat appUserID = lowercased Supabase user id).
  const missing = content.books.filter((b) => !owned.has(b.slug));
  const rcKey = process.env.REVENUECAT_SECRET_KEY;
  if (missing.length && rcKey) {
    try {
      const rc = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id.toLowerCase())}`, {
        headers: { Authorization: `Bearer ${rcKey}` },
        next: { revalidate: 0 },
      });
      if (rc.ok) {
        const j = await rc.json();
        const nonSubs = j?.subscriber?.non_subscriptions || {};
        for (const b of missing) {
          const list = nonSubs[bookProductId(b.slug)];
          if (Array.isArray(list) && list.length > 0) owned.add(b.slug);
        }
      }
    } catch {
      /* treat as not owned */
    }
  }
  return owned;
});

/** Short-lived signed URL for the book's PDF, or null when not owned/missing. */
export async function getBookReadUrl(slug: BookSlug): Promise<string | null> {
  const owned = await getOwnedBookSlugs();
  if (!owned.has(slug)) return null;
  const { data, error } = await createAdminClient().storage.from(BUCKET).createSignedUrl(`${slug}.pdf`, SIGNED_TTL);
  if (error || !data?.signedUrl) {
    console.error("[books] signed url failed:", error?.message);
    return null;
  }
  return data.signedUrl;
}

export { bookPurchaseType };
