"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import {
  approveManualOrder,
  rejectManualOrder,
  type ManualOrderRow,
} from "@/actions/coran-manual-order";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-600",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  approved: "Validée",
  rejected: "Rejetée",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ManualOrdersForm({ initial }: { initial: ManualOrderRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const run = (
    id: number,
    fn: () => Promise<{ error?: string; emailSent?: boolean; ok?: boolean }>,
  ) =>
    startTransition(async () => {
      setBusyId(id);
      setMsg(null);
      const res = await fn();
      if (res?.error) setMsg(res.error);
      else if (res?.emailSent === false)
        setMsg("Accès accordé, mais l'email n'est pas parti (voir logs Resend).");
      setBusyId(null);
      router.refresh();
    });

  const pendingCount = initial.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          Commandes Orange Money (manuelles) ·{" "}
          <span className="font-semibold text-amber-600">{pendingCount} en attente</span>
        </p>
        <button onClick={() => router.refresh()} className="text-xs font-semibold text-[#6967fb] hover:underline">
          Rafraîchir
        </button>
      </div>

      {msg && <p className="rounded-lg bg-neutral-100 px-3 py-2 text-xs text-neutral-700">{msg}</p>}

      {initial.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
          Aucune commande Orange Money pour l&apos;instant.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs font-semibold text-neutral-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">ID transaction</th>
                <th className="px-3 py-2">Numéro</th>
                <th className="px-3 py-2">Montant</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {initial.map((o) => (
                <tr key={o.id} className="align-middle">
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-neutral-500">{fmtDate(o.createdAt)}</td>
                  <td className="px-3 py-2 font-medium text-neutral-800">{o.email}</td>
                  <td className="px-3 py-2 font-mono text-xs text-neutral-700">{o.txId}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-neutral-600">{o.phone || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-neutral-600">{o.amountLabel || "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[o.status] || ""}`}>
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {o.status === "pending" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={pending && busyId === o.id}
                          onClick={() => run(o.id, () => approveManualOrder(o.id))}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" /> Valider
                        </button>
                        <button
                          disabled={pending && busyId === o.id}
                          onClick={() => run(o.id, () => rejectManualOrder(o.id))}
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" /> Rejeter
                        </button>
                      </div>
                    ) : (
                      <span className="block text-right text-xs text-neutral-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
