"use client";

import { useState } from "react";

import { submitOrangeMoneyOrder } from "@/actions/coran-manual-order";
import type { CoranOrangeMoney } from "@/lib/coran-landing-content";

/**
 * Manual Orange Money payment option (Option A): the buyer sends money to the
 * merchant number, then submits their email + the OM transaction id. An admin
 * validates it later and access is granted by email. No payment is verified
 * on-page.
 */
export function OrangeMoneyPay({ om }: { om: CoranOrangeMoney }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [txId, setTxId] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      const res = await submitOrangeMoneyOrder({ email, txId, phone });
      if (res?.error) setErr(res.error);
      else setDone(true);
    } catch {
      setErr("Échec de l'envoi. Réessaie.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs font-medium text-neutral-400">ou</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#ff7900] bg-[#fff5ec] px-4 py-3 text-sm font-bold text-[#ff7900] transition hover:bg-[#ffe9d6]"
        >
          <span className="grid h-5 w-5 place-items-center rounded bg-[#ff7900] text-[10px] font-black text-white">
            OM
          </span>
          Payer avec Orange Money
        </button>
      ) : (
        <div className="rounded-xl border border-[#ffd9b3] bg-[#fff9f3] p-4 text-neutral-800">
          {done ? (
            <div className="text-center">
              <p className="text-sm font-bold text-[#c2570a]">Paiement reçu 🎉</p>
              <p className="mt-1 text-xs text-neutral-600">
                On vérifie ta transaction et tu recevras ton accès par email très vite,
                in cha Allah. Pense à regarder tes spams.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-[#ffd9b3] bg-white p-3 text-sm">
                {om.amountLabel && (
                  <p>
                    Montant à envoyer :{" "}
                    <span className="font-bold text-[#c2570a]">{om.amountLabel}</span>
                  </p>
                )}
                {om.number && (
                  <p className="mt-0.5">
                    Numéro Orange Money :{" "}
                    <span className="font-bold tracking-wide">{om.number}</span>
                  </p>
                )}
              </div>
              {om.instructions && (
                <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-neutral-600">
                  {om.instructions}
                </p>
              )}

              <div className="mt-3 space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ton email (pour recevoir l'accès)"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#ff7900]"
                />
                <input
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="ID de la transaction Orange Money"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#ff7900]"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ton numéro (facultatif)"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#ff7900]"
                />
              </div>

              {err && <p className="mt-2 text-xs font-medium text-rose-500">{err}</p>}

              <button
                onClick={submit}
                disabled={busy}
                className="mt-3 w-full rounded-xl bg-[#ff7900] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#e96e00] disabled:opacity-60"
              >
                {busy ? "Envoi…" : "J'ai payé, valider ma commande"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
