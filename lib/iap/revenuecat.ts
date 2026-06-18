/**
 * Apple In-App Purchase via RevenueCat — used ONLY inside the native iOS app.
 *
 * Apple forbids selling digital content with Stripe inside the app (it requires
 * In-App Purchase, 15–30% fee). So when the user is in the iOS shell we present
 * Apple's IAP instead of the Stripe checkout. RevenueCat wraps StoreKit and,
 * via its server-to-server webhook (app/api/webhooks/revenuecat/route.ts), lets
 * us grant premium on our backend the same way the Stripe webhook does today.
 *
 * Everything here is dynamically imported and guarded by `isNativeIOS()`, so it
 * is completely inert on the web (no native code is loaded in the browser).
 *
 * SETUP REQUIRED (see docs/ios-app-store.md):
 *  1. RevenueCat project → add the iOS app + App Store Connect shared secret.
 *  2. Create an entitlement named "premium".
 *  3. Create an Offering ("default") whose packages use the identifiers in
 *     PLAN_TO_RC_PACKAGE below, each attached to the matching App Store product.
 *  4. Put the RevenueCat public iOS key in NEXT_PUBLIC_REVENUECAT_IOS_KEY.
 *  5. Set the RevenueCat appUserID to the Supabase user id (done in initIAP)
 *     so the webhook can map purchases back to the right account.
 */
import { isNativeIOS } from "@/lib/platform";
import type { PremiumPlan } from "@/lib/premium";

const RC_IOS_KEY = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY || "";
const ENTITLEMENT = "premium";

let configured = false;

/**
 * Our plans → RevenueCat package identifiers. These use RevenueCat's standard
 * duration identifiers; create the matching packages in your "default" Offering.
 */
export const PLAN_TO_RC_PACKAGE: Record<PremiumPlan, string> = {
  three_months: "$rc_three_month",
  six_months: "$rc_six_month",
  annual: "$rc_annual",
  lifetime: "$rc_lifetime",
  monthly_trial: "$rc_monthly",
};

/** Initialise RevenueCat once, tying the SDK to the signed-in user id. */
export async function initIAP(appUserId?: string | null): Promise<void> {
  if (!isNativeIOS() || configured || !RC_IOS_KEY) return;
  const { Purchases, LOG_LEVEL } = await import("@revenuecat/purchases-capacitor");
  await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
  await Purchases.configure({ apiKey: RC_IOS_KEY, appUserID: appUserId ?? undefined });
  configured = true;
}

/**
 * Real, localised App Store prices keyed by package identifier
 * (e.g. { "$rc_annual": "119,99 €" }). Empty on web or if not configured.
 * Apple requires the displayed price to match what StoreKit charges, so the
 * paywall uses these instead of the hardcoded EUR strings when on iOS.
 */
export async function getIapPrices(): Promise<Record<string, string>> {
  if (!isNativeIOS()) return {};
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const offerings = await Purchases.getOfferings();
    const pkgs = offerings.current?.availablePackages ?? [];
    const out: Record<string, string> = {};
    for (const p of pkgs) out[p.identifier] = p.product.priceString;
    return out;
  } catch (e) {
    console.error("[IAP] getIapPrices failed:", e);
    return {};
  }
}

/** Presents Apple's native purchase sheet for the given plan. */
export async function purchasePlan(
  plan: PremiumPlan,
): Promise<{ success: boolean; error?: string }> {
  if (!isNativeIOS()) return { success: false, error: "IAP is iOS-only." };
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const offerings = await Purchases.getOfferings();
    const wanted = PLAN_TO_RC_PACKAGE[plan];
    const pkg = offerings.current?.availablePackages?.find(
      (p) => p.identifier === wanted,
    );
    if (!pkg) return { success: false, error: "Offre indisponible." };
    const res = await Purchases.purchasePackage({ aPackage: pkg });
    const active = Boolean(res.customerInfo.entitlements.active[ENTITLEMENT]);
    return { success: active };
  } catch (e: any) {
    if (e?.userCancelled) return { success: false, error: "cancelled" };
    return { success: false, error: e?.message || "Achat impossible." };
  }
}

/** "Restaurer mes achats" — required by Apple for any IAP app. */
export async function restorePurchases(): Promise<{ success: boolean; error?: string }> {
  if (!isNativeIOS()) return { success: false, error: "IAP is iOS-only." };
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const info = await Purchases.restorePurchases();
    return { success: Boolean(info.customerInfo.entitlements.active[ENTITLEMENT]) };
  } catch (e: any) {
    return { success: false, error: e?.message || "Restauration impossible." };
  }
}
