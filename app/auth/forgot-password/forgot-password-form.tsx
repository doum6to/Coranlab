"use client";

import { useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { RiveMascot } from "@/components/rive-mascot";
import { ShinyButton } from "@/components/ui/shiny-button";

/**
 * "Mot de passe oublié" — sends a Supabase reset email. The link lands on
 * /auth/callback (which exchanges the recovery code for a session) and then
 * forwards to /auth/reset-password where the user sets a new password.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center gap-y-2">
          <div className="h-60 w-60">
            <RiveMascot src="/animations/eyes_down.riv" animationName="eyes down" />
          </div>
          <h1 className="text-2xl font-bold text-brilliant-text font-heading">
            Mot de passe oublié ?
          </h1>
          <p className="text-brilliant-muted text-sm text-center">
            Entre ton e-mail, on t&apos;envoie un lien pour le réinitialiser.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <p className="rounded-xl border border-brilliant-green/30 bg-brilliant-success/40 px-4 py-3 text-sm font-medium text-brilliant-green">
              E-mail envoyé ✓ Vérifie ta boîte de réception (et les spams) et
              clique sur le lien pour choisir un nouveau mot de passe.
            </p>
            <Link
              href="/auth/login"
              className="inline-block text-sm font-semibold text-[#6967fb] hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="text-sm font-medium text-brilliant-text"
                  htmlFor="email"
                >
                  E-mail
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
              {error && <p className="text-sm text-rose-500">{error}</p>}
              <ShinyButton type="submit" variant="green" disabled={loading}>
                {loading ? "Envoi…" : "Envoyer le lien"}
              </ShinyButton>
            </form>

            <p className="text-center text-sm text-brilliant-muted">
              <Link
                href="/auth/login"
                className="text-[#6967fb] hover:underline font-semibold"
              >
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
