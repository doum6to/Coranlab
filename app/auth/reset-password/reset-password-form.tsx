"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { RiveMascot } from "@/components/rive-mascot";
import { ShinyButton } from "@/components/ui/shiny-button";

/**
 * Set a new password. Reached from the reset email via /auth/callback, which
 * has already exchanged the recovery code for a session — so updateUser() can
 * set the password directly. Guards against landing here without a session.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  // Confirm a recovery session exists (set by /auth/callback).
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
    setTimeout(() => {
      router.push("/learn");
      router.refresh();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center gap-y-2">
          <div className="h-60 w-60">
            <RiveMascot src="/animations/eyes_down.riv" animationName="eyes down" />
          </div>
          <h1 className="text-2xl font-bold text-brilliant-text font-heading">
            Nouveau mot de passe
          </h1>
          <p className="text-brilliant-muted text-sm text-center">
            Choisis un nouveau mot de passe pour ton compte.
          </p>
        </div>

        {hasSession === false ? (
          <div className="space-y-4 text-center">
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              Lien invalide ou expiré. Redemande un e-mail de réinitialisation.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-block text-sm font-semibold text-[#6967fb] hover:underline"
            >
              Renvoyer un lien
            </Link>
          </div>
        ) : done ? (
          <p className="rounded-xl border border-brilliant-green/30 bg-brilliant-success/40 px-4 py-3 text-center text-sm font-medium text-brilliant-green">
            Mot de passe mis à jour ✓ Redirection…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-brilliant-text" htmlFor="password">
                Nouveau mot de passe
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
            <div>
              <label className="text-sm font-medium text-brilliant-text" htmlFor="confirm">
                Confirme le mot de passe
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-brilliant-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6967fb] focus:border-transparent"
                required
                minLength={6}
              />
            </div>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <ShinyButton type="submit" variant="green" disabled={loading || hasSession === null}>
              {loading ? "Mise à jour…" : "Mettre à jour"}
            </ShinyButton>
          </form>
        )}
      </div>
    </div>
  );
}
