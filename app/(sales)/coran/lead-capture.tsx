"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";

import { subscribeLeadMagnet } from "@/actions/lead-magnet";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Free lead-magnet capture: the visitor drops their email to receive the free
 * "20 words" email. On success we show a confirmation and (best-effort) the
 * server schedules the follow-up drip. Non-blocking to the checkout below.
 */
export function LeadCapture({
  heading,
  subtext,
  button,
  source,
}: {
  heading: string;
  subtext: string;
  button: string;
  source: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res = await subscribeLeadMagnet({ email: email.trim(), source });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-5 w-5" strokeWidth={3} />
        </div>
        <p className="font-display text-base font-bold text-emerald-900">
          C&apos;est envoyé ! 📩
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          Vérifie ta boîte mail (et tes spams) : tes mots gratuits arrivent tout de suite.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="font-display text-base font-bold text-neutral-900">{heading}</h2>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">{subtext}</p>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            placeholder="ton@email.com"
            className="w-full rounded-xl border border-neutral-300 bg-white py-3 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-[#6967fb] focus:ring-1 focus:ring-[#6967fb]"
          />
        </div>
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 rounded-xl bg-[#6967fb] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5856e0] disabled:opacity-60"
        >
          {state === "loading" ? "Envoi…" : button}
        </button>
      </form>
      {state === "error" && (
        <p className="mt-2 text-xs font-semibold text-red-600">
          Oups, vérifie ton email et réessaie.
        </p>
      )}
      <p className="mt-2 text-[11px] text-neutral-400">
        100% gratuit · pas de spam · désabonnement en 1 clic
      </p>
    </div>
  );
}
