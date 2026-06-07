"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  grantPremium,
  revokePremium,
  grantArabicCourse,
  revokeArabicCourse,
} from "@/actions/admin-premium";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string | null;
  isPremium: boolean;
  plan: string;
  source: string;
  periodEnd: string | null;
  hasArabicCourse: boolean;
};

type Filter = "all" | "premium" | "free";

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const UsersTable = ({
  users,
  premiumCount,
  freeCount,
}: {
  users: AdminUser[];
  premiumCount: number;
  freeCount: number;
}) => {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === "premium" && !u.isPremium) return false;
      if (filter === "free" && u.isPremium) return false;
      if (q && !u.email.toLowerCase().includes(q) && !u.name.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [users, filter, search]);

  const onGrant = (u: AdminUser) => {
    setPendingId(u.id);
    startTransition(async () => {
      try {
        await grantPremium(u.id);
        router.refresh();
      } finally {
        setPendingId(null);
      }
    });
  };

  const onRevoke = (u: AdminUser) => {
    if (
      !window.confirm(
        `Révoquer l'accès premium de ${u.email} ?\n\n(Si l'utilisateur a un abonnement Stripe actif, pensez à l'annuler aussi dans Stripe, sinon le prochain paiement réussi rétablira l'accès.)`,
      )
    )
      return;
    setPendingId(u.id);
    startTransition(async () => {
      try {
        await revokePremium(u.id);
        router.refresh();
      } finally {
        setPendingId(null);
      }
    });
  };

  const onArabic = (u: AdminUser) => {
    if (!u.email || u.email === "—") return;
    if (
      u.hasArabicCourse &&
      !window.confirm(`Révoquer l'accès au cours « Lire l'arabe » de ${u.email} ?`)
    )
      return;
    setPendingId(u.id);
    startTransition(async () => {
      try {
        if (u.hasArabicCourse) await revokeArabicCourse(u.email);
        else await grantArabicCourse(u.email);
        router.refresh();
      } finally {
        setPendingId(null);
      }
    });
  };

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/premium/login");
    router.refresh();
  };

  const TabButton = ({ value, label }: { value: Filter; label: string }) => (
    <button
      onClick={() => setFilter(value)}
      className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
        filter === value
          ? "bg-brilliant-green text-white"
          : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Gestion premium
          </h1>
          <p className="text-sm text-neutral-500">
            {premiumCount} premium · {freeCount} gratuit ·{" "}
            {premiumCount + freeCount} au total
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-600 hover:bg-neutral-100"
        >
          Déconnexion
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <TabButton value="all" label="Tous" />
        <TabButton value="premium" label="Premium" />
        <TabButton value="free" label="Gratuit" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher (email ou nom)…"
          className="ml-auto w-full max-w-xs rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Inscrit le</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Échéance</th>
              <th className="px-4 py-3 font-semibold">Cours arabe</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-neutral-400"
                >
                  Aucun utilisateur.
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
              >
                <td className="px-4 py-3 font-medium text-neutral-800">
                  {u.email}
                </td>
                <td className="px-4 py-3 text-neutral-600">{u.name}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {fmtDate(u.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {u.isPremium ? (
                    <span className="inline-flex rounded-full bg-brilliant-green/10 px-2.5 py-1 text-xs font-bold text-brilliant-green">
                      {u.plan}
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-500">
                      Gratuit
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-500">{u.source}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {fmtDate(u.periodEnd)}
                </td>
                <td className="px-4 py-3">
                  {u.hasArabicCourse ? (
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                      Accès
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-400">
                      —
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {u.isPremium ? (
                      <Button
                        size="sm"
                        variant="dangerOutline"
                        disabled={pendingId === u.id}
                        onClick={() => onRevoke(u)}
                      >
                        {pendingId === u.id ? "…" : "Révoquer premium"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="primaryOutline"
                        disabled={pendingId === u.id}
                        onClick={() => onGrant(u)}
                      >
                        {pendingId === u.id ? "…" : "Donner premium"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={u.hasArabicCourse ? "dangerOutline" : "primaryOutline"}
                      disabled={pendingId === u.id || !u.email || u.email === "—"}
                      onClick={() => onArabic(u)}
                    >
                      {pendingId === u.id
                        ? "…"
                        : u.hasArabicCourse
                          ? "Retirer cours arabe"
                          : "Donner cours arabe"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
