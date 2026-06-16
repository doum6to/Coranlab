import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { coursePurchase } from "@/db/schema";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { getOfferSettings } from "@/lib/offer";
import { getVipSettings, isVipCustomer, cleanDriveUrl } from "@/lib/vip";
import { auth, currentUser } from "@/lib/supabase/server";
import { SettingsView } from "./settings-view";

const SettingsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/login");
  }

  const [user, userProgress, userSubscription] = await Promise.all([
    currentUser(),
    getUserProgress(),
    getUserSubscription(),
  ]);

  if (!userProgress) {
    redirect("/courses");
  }

  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  // Google Drive links copied from the browser contain a "/u/<n>/" account
  // slot that only works for the owner — strip it so the link works for
  // everyone.
  const cleanDrive = (url: string) =>
    url.replace(
      /drive\.google\.com\/drive\/u\/\d+\//,
      "drive.google.com/drive/",
    );

  // Show the PDF documents to people who bought (matched by email) or who
  // have a lifetime grant.
  const offerSettings = await getOfferSettings();
  let documents = offerSettings.pdfLinks;
  if (!documents.length && process.env.COURSE_DRIVE_URL) {
    documents = [
      { label: "Tous les documents (PDF)", url: process.env.COURSE_DRIVE_URL },
    ];
  }
  documents = documents.map((d) => ({ ...d, url: cleanDrive(d.url) }));

  // VIP buyers (came from another platform via /acces-vip) get their OWN
  // dedicated Drive links instead of the standard ones.
  if (isVipCustomer(userSubscription?.stripeCustomerId)) {
    const vip = await getVipSettings();
    if (vip.driveLinks.length) {
      documents = vip.driveLinks.map((d) => ({
        label: d.label,
        url: cleanDriveUrl(d.url),
      }));
    }
  }

  const purchase = email
    ? await db.query.coursePurchase.findFirst({
        where: eq(coursePurchase.email, email.toLowerCase()),
      })
    : null;
  const hasDocs = !!purchase || !!userSubscription?.isLifetime;

  return (
    <SettingsView
      userName={userProgress.userName}
      email={email}
      isPro={!!userSubscription?.isActive}
      subscriptionEndDate={
        userSubscription?.stripeCurrentPeriodEnd?.toISOString() ?? null
      }
      hasStripeCustomer={!!userSubscription?.stripeCustomerId}
      isLifetime={!!userSubscription?.isLifetime}
      documents={hasDocs ? documents : []}
    />
  );
};

export default SettingsPage;
