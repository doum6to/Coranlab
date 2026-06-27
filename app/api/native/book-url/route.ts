import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Native iOS endpoint: returns a short-lived signed URL for a purchased ebook.
 *
 * Security: the full PDF lives in a PRIVATE Supabase Storage bucket ("books").
 * We only hand back a signed URL after verifying — server-side, via the
 * RevenueCat REST API — that this user actually owns the product. The book
 * therefore never ships inside the app and can't be downloaded without paying.
 *
 * Setup (one-time, by the app owner):
 *   1. Create a private Storage bucket named "books"; upload each full book as
 *      "<slug>.pdf" where the product id is "app.quranlab.book.<slug>".
 *   2. Add env var REVENUECAT_SECRET_KEY (RevenueCat → API keys → secret).
 *   3. SUPABASE_SERVICE_ROLE_KEY is already used by createAdminClient().
 *
 * Additive only — does not touch any web route.
 */
export const dynamic = "force-dynamic";

const BUCKET = "books";
const TTL = 60 * 60; // 1 hour

export async function GET(req: Request) {
  const authz = req.headers.get("authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  // RevenueCat appUserID is the lowercased Supabase user id (set by the app).
  const userId = userData.user.id.toLowerCase();

  const url = new URL(req.url);
  const productId = url.searchParams.get("productId") || "";
  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  const rcKey = process.env.REVENUECAT_SECRET_KEY;
  if (!rcKey) {
    return NextResponse.json({ error: "Store not configured" }, { status: 503 });
  }

  // 1. Verify ownership via RevenueCat.
  let owned = false;
  try {
    const rc = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
      { headers: { Authorization: `Bearer ${rcKey}` } }
    );
    if (rc.ok) {
      const j = await rc.json();
      const nonSubs = j?.subscriber?.non_subscriptions || {};
      owned = Array.isArray(nonSubs[productId]) && nonSubs[productId].length > 0;
    }
  } catch {
    /* treat as not owned */
  }
  if (!owned) {
    return NextResponse.json({ error: "Not owned" }, { status: 403 });
  }

  // 2. Sign the private file. product "app.quranlab.book.tajwid" → "tajwid.pdf".
  const slug = productId.split(".").pop() || productId;
  const path = `${slug}.pdf`;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, TTL);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  return NextResponse.json({ url: data.signedUrl });
}
