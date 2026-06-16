"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Download, ShieldCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { RiveMascot } from "@/components/rive-mascot";
import { ShinyButton } from "@/components/ui/shiny-button";
import { redeemVipAccess } from "@/actions/vip";

type DriveLink = { label: string; url: string };

export function VipForm({
  intro,
  code,
  valid,
}: {
  intro: string;
  code: string;
  valid: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{
    existed: boolean;
    driveLinks: DriveLink[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await redeemVipAccess({
        email: email.trim(),
        password,
        name: name.trim(),
        code,
      });
      if ("error" in res) {
        setError(res.error || "Une erreur est survenue. Réessaie.");
        setLoading(false);
        return;
      }

      // New accounts: sign in so the app is immediately accessible. Existing
      // accounts keep their own password — we just show their access below.
      if (!res.existed) {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({ email: email.trim(), password });
      }
      setDone({ existed: res.existed, driveLinks: res.driveLinks });
      setLoading(false);
    } catch {
      setError("Une erreur est survenue. Réessaie.");
      setLoading(false);
    }
  };

  // Invalid / missing code → don't expose the form at all.
  if (!valid) {
    return (
      <Shell>
        <div className="space-y-3 text-center">
          <h1 className="font-heading text-2xl font-bold text-brilliant-text">
            Lien invalide
          </h1>
          <p className="text-sm text-brilliant-muted">
            Ce lien d&apos;activation n&apos;est pas valide ou a expiré. Vérifie
            que tu as bien copié le lien complet, ou contacte le support.
          </p>
        </div>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brilliant-green/10 text-brilliant-green">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-brilliant-text">
            Ton accès est activé 🤍
          </h1>
          <p className="text-sm text-brilliant-muted">
            {done.existed
              ? "Ton accès premium a été ajouté à ton compte existant. Connecte-toi avec ton mot de passe habituel pour accéder à l'application."
              : "Ton compte premium est prêt. Tu es connecté(e) : tu peux ouvrir l'application quand tu veux."}
          </p>

          {done.driveLinks.length > 0 && (
            <div className="rounded-2xl border border-brilliant-border bg-neutral-50 p-4 text-left">
              <p className="mb-2 text-sm font-semibold text-brilliant-text">
                📂 Tes documents (PDF) — Comprendre 85% du Coran
              </p>
              <ul className="space-y-2">
                {done.driveLinks.map((d, i) => (
                  <li key={i}>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-xl border border-brilliant-border bg-white px-3 py-2.5 text-sm font-medium text-brilliant-text transition hover:border-[#6967fb]"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#6967fb]" />
                        {d.label || "Document PDF"}
                      </span>
                      <Download className="h-4 w-4 text-neutral-400" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ShinyButton
            variant="green"
            onClick={() => {
              window.location.href = done.existed ? "/auth/login" : "/learn";
            }}
          >
            {done.existed ? "Me connecter" : "Ouvrir l'application"}
          </ShinyButton>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex flex-col items-center gap-y-2">
        <div className="h-48 w-48">
          <RiveMascot src="/animations/eyes_down.riv" animationName="eyes down" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-brilliant-text">
          Active ton accès VIP
        </h1>
      </div>

      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-medium leading-relaxed text-amber-800">{intro}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-brilliant-text" htmlFor="name">
            Prénom
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brilliant-border px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6967fb]"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-brilliant-text" htmlFor="email">
            E-mail utilisé lors de l&apos;achat
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brilliant-border px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6967fb]"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-brilliant-text" htmlFor="password">
            Choisis un mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brilliant-border px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6967fb]"
            required
            minLength={6}
          />
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <ShinyButton type="submit" variant="green" disabled={loading}>
          {loading ? "Activation…" : "Activer mon accès premium"}
        </ShinyButton>
      </form>

      <p className="text-center text-sm text-brilliant-muted">
        Tu as déjà un compte ?{" "}
        <Link href="/auth/login" className="font-semibold text-[#6967fb] hover:underline">
          Se connecter
        </Link>
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-6 p-8">{children}</div>
    </div>
  );
}
