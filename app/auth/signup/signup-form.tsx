"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RiveMascot } from "@/components/rive-mascot";
import { ShinyButton } from "@/components/ui/shiny-button";

import { createTrialCheckoutUrl } from "@/actions/trial-checkout";
import { ttqTrack } from "@/lib/analytics/tiktok";
import { useT } from "@/lib/i18n/use-t";

export function SignUpForm() {
  const t = useT();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";
  const hasCoursePurchase = Boolean(searchParams.get("course_token"));
  const isTrialSignup = searchParams.get("trial") === "true";
  // When arriving from a purchase, lock the email so the account is created
  // with the exact email used at checkout (that's how the purchase is linked).
  const lockEmail =
    !!prefilledEmail &&
    (searchParams.get("locked") === "1" || hasCoursePurchase);

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (prefilledEmail && !email) setEmail(prefilledEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledEmail]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create user server-side (auto-confirmed, no email verification)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error || t.auth.createError);
        setLoading(false);
        return;
      }

      // 2. Sign in client-side to get a session cookie
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // 3a. Trial flow: go through Stripe Checkout to collect CB + start trial
      if (isTrialSignup && body.user?.id) {
        ttqTrack("CompleteRegistration", {
          content_category: "trial_signup",
        });

        const trial = await createTrialCheckoutUrl({
          userId: body.user.id,
          email: email.trim(),
        });
        if (trial.url) {
          window.location.href = trial.url;
          return;
        }
        // Trial checkout failed: fall through to /learn so the user still has
        // a free-tier account. They can try upgrading later from settings.
        setError(trial.error || t.auth.paymentFailed);
      }

      // 3b. Normal signup: straight to /learn
      router.push("/learn");
      router.refresh();
    } catch {
      setError(t.auth.serverError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center gap-y-2">
          <div className="h-60 w-60">
            <RiveMascot src="/animations/eyes_down.riv" animationName="eyes down" />
          </div>
          <h1 className="text-2xl font-bold text-brilliant-text font-heading">
            {t.auth.signupTitle}
          </h1>
          <p className="text-brilliant-muted text-sm text-center">
            {hasCoursePurchase
              ? t.auth.signupSubtitlePremium
              : isTrialSignup
                ? t.auth.signupSubtitleTrial
                : t.auth.signupSubtitleDefault}
          </p>
        </div>

        {hasCoursePurchase && (
          <div className="rounded-xl border-2 border-b-4 border-[#6967fb]/30 bg-[#6967fb]/5 p-3 text-center">
            <p className="text-xs font-semibold text-[#6967fb]">
              {t.auth.premiumDetected}
            </p>
          </div>
        )}

        {isTrialSignup && (
          <div className="rounded-xl border border-[#6967fb]/30 bg-[#6967fb]/5 p-3">
            <p className="text-xs font-semibold text-[#6967fb] text-center tracking-wide uppercase">
              {t.auth.trialBadge}
            </p>
            <p className="mt-1 text-[11px] text-brilliant-muted text-center leading-relaxed">
              {t.auth.trialDesc}
            </p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label
              className="text-sm font-medium text-brilliant-text"
              htmlFor="name"
            >
              {t.auth.name}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-brilliant-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6967fb] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-brilliant-text"
              htmlFor="email"
            >
              {t.auth.email}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={lockEmail}
              className={`w-full mt-1 px-3 py-2 border border-brilliant-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6967fb] focus:border-transparent ${
                lockEmail ? "bg-neutral-100 text-neutral-500 cursor-not-allowed" : ""
              }`}
              required
            />
            {lockEmail && (
              <p className="mt-1 text-[11px] text-brilliant-muted">
                {t.auth.emailLocked}
              </p>
            )}
          </div>
          <div>
            <label
              className="text-sm font-medium text-brilliant-text"
              htmlFor="password"
            >
              {t.auth.password}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-brilliant-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6967fb] focus:border-transparent"
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <ShinyButton type="submit" variant="green" disabled={loading}>
            {loading ? t.auth.creating : t.auth.signup}
          </ShinyButton>
        </form>

        <p className="text-center text-sm text-brilliant-muted">
          {t.auth.haveAccount}{" "}
          <Link
            href="/auth/login"
            className="text-[#6967fb] hover:underline font-semibold"
          >
            {t.auth.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
