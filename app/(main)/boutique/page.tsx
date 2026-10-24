import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/supabase/server";
import { getUserSubscription } from "@/db/queries";
import { getBooksContent } from "@/lib/books-content";
import { getOwnedBookSlugs } from "@/lib/books-access";
import { getServerStrings } from "@/lib/i18n/server-t";
import { BoutiqueView } from "./boutique-view";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const { t } = getServerStrings();
  return { title: `${t.shop.nav} — Quranlab` };
}

export default async function BoutiquePage({ searchParams }: { searchParams?: { bought?: string; tab?: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/auth/login");

  const [content, owned, sub] = await Promise.all([getBooksContent(), getOwnedBookSlugs(), getUserSubscription()]);
  const { t, locale } = getServerStrings();
  // Admin copy is French-only: in other languages the shop chrome comes from
  // the dictionary (book titles/descriptions stay as entered in the admin).
  const localized = locale === "fr" ? content : {
    ...content,
    shopTitle: t.shop.title, shopSubtitle: t.shop.subtitle, tabShop: t.shop.tabShop, tabLibrary: t.shop.tabLibrary,
    includedLabel: t.shop.included, ownedLabel: t.shop.owned, buyLabel: t.shop.buy, readLabel: t.shop.read,
    premiumLabel: t.shop.premium, emptyLibrary: t.shop.empty,
  };

  return (
    <BoutiqueView
      content={localized}
      ownedSlugs={Array.from(owned)}
      isPro={!!sub?.isActive}
      bought={searchParams?.bought ?? null}
      initialTab={searchParams?.tab === "library" ? "library" : "shop"}
      strings={{ bought: t.shop.bought }}
    />
  );
}
