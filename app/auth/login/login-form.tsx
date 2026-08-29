"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RiveMascot } from "@/components/rive-mascot";
import { ShinyButton } from "@/components/ui/shiny-button";
import { claimPurchase } from "@/actions/claim-purchase";
import { diagnoseAccess } from "@/actions/diagnose-access";
import { useT } from "@/lib/i18n/use-t";

type ErrKind = "generic" | "hasAccount" | "paidNoAccount";

export function LoginForm() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errKind, setErrKind] = useState<ErrKind | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrKind(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Turn "Invalid login credentials" into actionable guidance: an existing
      // account → reset password; a paid buyer with no account → create it.
      let kind: ErrKind = "generic";
      try {
        const d = await diagnoseAccess(email);
        if (d.hasAccount) kind = "hasAccount";
        else if (d.hasPaid) kind = "paidNoAccount";
      } catch {
        /* fall back to generic */
      }
      setErrKind(kind);
      setLoading(false);
      return;
    }

    // Link any pending purchase made with this email (covers buyers who
    // already had an account). Non-blocking on failure.
    try {
      await claimPurchase();
    } catch {
      /* non-fatal */
    }

    router.push("/learn");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center gap-y-2">
          <div className="h-60 w-60">
            <RiveMascot src="/animations/eyes_down.riv" animationName="eyes down" />
          </div>
          <h1 className="text-2xl font-bold text-brilliant-text font-heading">
            {t.auth.welcomeBack}
          </h1>
          <p className="text-brilliant-muted text-sm text-center">
            {t.auth.loginSubtitle}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              className="w-full mt-1 px-3 py-2 border border-brilliant-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6967fb] focus:border-transparent"
              required
            />
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
            />
          </div>
          {errKind === "generic" && (
            <p className="text-sm text-rose-500">E-mail ou mot de passe incorrect.</p>
          )}
          {errKind === "hasAccount" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Mot de passe incorrect.{" "}
              <Link
                href={`/auth/forgot-password?email=${encodeURIComponent(email)}`}
                className="font-semibold underline"
              >
                Réinitialiser mon mot de passe
              </Link>
            </div>
          )}
          {errKind === "paidNoAccount" && (
            <div className="rounded-xl border border-[#6967fb]/30 bg-[#6967fb]/5 p-3 text-sm text-brilliant-text">
              ✅ Ton paiement est bien reçu — mais ton compte n&apos;est{" "}
              <strong>pas encore créé</strong>. Crée-le (choisis un mot de passe) et
              ton Premium sera activé automatiquement.
              <Link
                href={`/auth/signup?email=${encodeURIComponent(email)}`}
                className="mt-2 block font-semibold text-[#6967fb] underline"
              >
                Créer mon compte →
              </Link>
            </div>
          )}
          <ShinyButton type="submit" variant="green" disabled={loading}>
            {loading ? t.auth.loggingIn : t.auth.login}
          </ShinyButton>
        </form>

        <p className="text-center text-sm">
          <Link
            href="/auth/forgot-password"
            className="text-brilliant-muted hover:text-[#6967fb] hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </p>

        <p className="text-center text-sm text-brilliant-muted">
          {t.auth.noAccount}{" "}
          <Link
            href="/auth/signup"
            className="text-[#6967fb] hover:underline font-semibold"
          >
            {t.auth.signupLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
