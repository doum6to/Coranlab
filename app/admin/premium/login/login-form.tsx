"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export const LoginForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Connexion impossible.");
      return;
    }

    startTransition(() => {
      router.replace("/admin/premium");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-600">
          Identifiant
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-600">
          Code
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
          required
        />
      </div>

      {error && <p className="text-sm font-medium text-rose-500">{error}</p>}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
};
