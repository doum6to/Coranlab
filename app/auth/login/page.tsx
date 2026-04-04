"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShinyButton } from "@/components/ui/shiny-button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/learn");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center gap-y-2">
          <Image src="/mascot.svg" height={50} width={50} alt="Mascot" />
          <h1 className="text-2xl font-bold text-brilliant-text font-heading">
            Bon retour !
          </h1>
          <p className="text-brilliant-muted text-sm text-center">
            Connecte-toi pour continuer à apprendre
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
            />
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <ShinyButton type="submit" variant="green" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </ShinyButton>
        </form>

        <p className="text-center text-sm text-brilliant-muted">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/signup"
            className="text-[#6967fb] hover:underline font-semibold"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
