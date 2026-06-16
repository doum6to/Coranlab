"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { updateVipSettings } from "@/actions/vip";
import type { VipSettings } from "@/lib/vip";

const inputCls =
  "w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brilliant-green focus:ring-2 focus:ring-brilliant-green/20";

export function VipForm({ initial }: { initial: VipSettings }) {
  const router = useRouter();
  const [c, setC] = useState<VipSettings>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/acces-vip?c=${encodeURIComponent(c.code)}`
      : `/acces-vip?c=${encodeURIComponent(c.code)}`;

  const onSave = () =>
    startTransition(async () => {
      setMsg(null);
      const res = await updateVipSettings(c);
      if (res?.error) setMsg({ ok: false, text: res.error });
      else {
        setMsg({ ok: true, text: "Enregistré ✓" });
        router.refresh();
      }
    });

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="mb-1 text-sm font-bold text-neutral-800">Lien à partager</h3>
        <p className="mb-2 text-xs text-neutral-500">
          Donne ce lien aux personnes ayant acheté sur une autre plateforme. En
          s&apos;inscrivant via ce lien, elles reçoivent le premium à vie + les
          PDF ci-dessous. Change le code pour invalider les anciens liens.
        </p>
        <div className="flex items-center gap-2">
          <input readOnly value={link} className={`${inputCls} bg-white`} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigator.clipboard?.writeText(link)}
          >
            Copier
          </Button>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-neutral-600">
          Code secret du lien
        </span>
        <input
          value={c.code}
          onChange={(e) => setC({ ...c, code: e.target.value })}
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-neutral-600">
          Message affiché (avertissement « même e-mail »)
        </span>
        <textarea
          rows={3}
          value={c.intro}
          onChange={(e) => setC({ ...c, intro: e.target.value })}
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-neutral-600">
          Liens Drive / PDF (un par ligne, format : Libellé | URL)
        </span>
        <textarea
          rows={5}
          value={c.driveLinks.map((l) => `${l.label} | ${l.url}`).join("\n")}
          onChange={(e) =>
            setC({
              ...c,
              driveLinks: e.target.value
                .split("\n")
                .map((line) => {
                  const [label, ...rest] = line.split("|");
                  return { label: (label || "").trim(), url: rest.join("|").trim() };
                })
                .filter((l) => l.url.length > 0),
            })
          }
          className={inputCls}
          placeholder="Comprendre 85% du Coran (PDF) | https://drive.google.com/drive/folders/…"
        />
        <span className="mt-1 block text-[11px] text-neutral-400">
          Mets ici le dossier Drive DÉDIÉ aux VIP (différent des autres
          acheteurs). Révélé uniquement après activation.
        </span>
      </label>

      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" disabled={pending} onClick={onSave}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {msg && (
          <span
            className={`text-sm font-medium ${msg.ok ? "text-brilliant-green" : "text-rose-500"}`}
          >
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
