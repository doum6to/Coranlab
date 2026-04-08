"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RiveMascot } from "@/components/rive-mascot";
import { ShinyButton } from "@/components/ui/shiny-button";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        setError(body.error || "Erreur lors de la création du compte.");
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

      router.push("/learn");
      router.refresh();
    } catch {
      setError("Erreur de connexion au serveur. Réessaie dans quelques instants.");
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
            Créer un compte
          </h1>
          <p className="text-brilliant-muted text-sm text-center">
            Commence à apprendre le vocabulaire du Coran aujourd&apos;hui
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label
              className="text-sm font-medium text-brilliant-text"
              htmlFor="name"
            >
              Nom
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
          <div>
            <label
              className="text-sm font-medium text-brilliant-text"
              htmlFor="password"
            >
              Mot de passe
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
            {loading ? "Création du compte..." : "S'inscrire"}
          </ShinyButton>
        </form>

        <p className="text-center text-sm text-brilliant-muted">
          Déjà un compte ?{" "}
          <Link
            href="/auth/login"
            className="text-[#6967fb] hover:underline font-semibold"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
