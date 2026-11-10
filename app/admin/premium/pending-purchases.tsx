"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { linkPurchaseToAccount, listPendingPurchases, type PendingPurchase } from "@/actions/admin-purchases";

const inputCls = "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900";

/**
 * Paid app purchases not yet attached to an account. Typical cause: the buyer
 * paid with one email and signed up / signs in with another. Enter the email
 * of their account to give them their access.
 */
export function PendingPurchases() {
  const [rows, setRows] = useState<PendingPurchase[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = () => listPendingPurchases().then(setRows).catch((e) => setErr(e?.message || "Erreur"));
  useEffect(() => { void load(); }, []);

  const shown = (rows ?? []).filter((r) => r.email.includes(q.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        Achats payés <strong>pas encore rattachés</strong> à un compte. En général, la personne a payé avec une adresse et s&apos;est
        inscrite avec une autre. Saisis l&apos;email de <strong>son compte</strong> puis « Activer » : l&apos;accès acheté est accordé à ce compte.
      </p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer par email d'achat…" className={inputCls} />
      {err && <p className="text-sm text-rose-600">{err}</p>}
      {rows === null ? (
        <p className="text-sm text-neutral-400">Chargement…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucun achat en attente.</p>
      ) : (
        <div className="space-y-2">
          {shown.map((r) => <Row key={r.id} row={r} onDone={load} />)}
        </div>
      )}
    </div>
  );
}

function Row({ row, onDone }: { row: PendingPurchase; onDone: () => void }) {
  const [account, setAccount] = useState(row.email);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const activate = () =>
    start(async () => {
      setMsg(null);
      const res = await linkPurchaseToAccount(row.id, account);
      if ("error" in res && res.error) setMsg({ ok: false, text: res.error });
      else { setMsg({ ok: true, text: "Accès activé ✓" }); setTimeout(onDone, 800); }
    });
  return (
    <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-neutral-900">{row.email}</span>
        <span className="text-xs text-neutral-500">
          {new Date(row.createdAt).toLocaleString("fr-FR")} · {row.subscription ? "abonnement" : "accès à vie"} · email {row.emailSent ? "envoyé" : "NON envoyé"}
        </span>
      </div>
      <div className="flex gap-2">
        <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Email du compte de la personne" className={inputCls} />
        <Button onClick={activate} disabled={pending || !account.trim()}>{pending ? "…" : "Activer"}</Button>
      </div>
      {msg && <p className={`text-xs ${msg.ok ? "text-green-700" : "text-rose-600"}`}>{msg.text}</p>}
    </div>
  );
}
