/**
 * Apple In-App Purchase via RevenueCat — used ONLY inside the native iOS app.
 *
 * Apple forbids selling digital content with Stripe inside the app (it requires
 * In-App Purchase, 15–30% fee). So when the user is in the iOS shell we present
 * Apple's IAP instead of the Stripe checkout. RevenueCat wraps StoreKit and,
 * via its server-to-server webhook, lets us grant premium on our backend the
 * same way the Stripe webhook does today.
 *
 * Everything here is dynamically imported and guarded by `isNativeIOS()`, so it
 * is completely inert on the web (no native code is loaded in the browser).
 *
 * SETUP REQUIRED (see docs/ios-app-store.md):
 *  1. Create a RevenueCat project, add the iOS app, paste your App Store
 *     Connect shared secret.
 *  2. Create products + an "Offering" in RevenueCat that mirror your plans.
 *  3. Put the RevenueCat public iOS key in NEXT_PUBLIC_REVENUECAT_IOS_KEY.
 *  4. Wire the RevenueCat webhook -> an API route that flips premium for the
 *     logged-in user (reuse the same entitlement logic as the Stripe webhook).
 */
import { isNativeIOS } from "@/lib/platform";

const RC_IOS_KEY = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY || "";

let configured = false;

/** Initialise RevenueCat once, tying the SDK to the signed-in user id. */
export async function initIAP(appUserId?: string): Promise<void> {
  if (!isNativeIOS() || configured || !RC_IOS_KEY) return;
  const { Purchases, LOG_LEVEL } = await import("@revenuecat/purchases-capacitor");
  await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
  await Purchases.configure({ apiKey: RC_IOS_KEY, appUserID: appUserId });
  configured = true;
}

/** Returns true if the user currently has the "premium" entitlement on device. */
export async function hasPremiumEntitlement(): Promise<boolean> {
  if (!isNativeIOS()) return false;
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  const info = await Purchases.getCustomerInfo();
  return Boolean(info.customerInfo.entitlements.active["premium"]);
}

/**
 * Presents Apple's native purchase sheet for the first package of the current
 * offering, then returns whether premium is now active. The backend should
 * still confirm via the RevenueCat webhook (source of truth).
 */
export async function purchasePremium(): Promise<{ success: boolean; error?: string }> {
  if (!isNativeIOS()) return { success: false, error: "IAP is iOS-only." };
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages?.[0];
    if (!pkg) return { success: false, error: "Aucun produit configuré." };
    const res = await Purchases.purchasePackage({ aPackage: pkg });
    const active = Boolean(res.customerInfo.entitlements.active["premium"]);
    return { success: active };
  } catch (e: any) {
    if (e?.userCancelled) return { success: false, error: "cancelled" };
    return { success: false, error: e?.message || "Achat impossible." };
  }
}

/** "Restaurer mes achats" — required by Apple for any IAP app. */
export async function restorePurchases(): Promise<boolean> {
  if (!isNativeIOS()) return false;
  const { Purchases } = await import("@revenuecat/purchases-capacitor");
  const info = await Purchases.restorePurchases();
  return Boolean(info.customerInfo.entitlements.active["premium"]);
}
