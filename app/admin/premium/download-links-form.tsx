"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { updateDownloadLinks } from "@/actions/download-links";
import type { DownloadLinks } from "@/lib/download-links";

const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900";

/** Admin editor for the smart download link (/telecharger). */
export function DownloadLinksForm({ initial }: { initial: DownloadLinks }) {
  const [c, setC] = useState<DownloadLinks>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const save = () =>
    start(async () => {
      setMsg(null);
      const res = await updateDownloadLinks(c);
      if (res && "error" in res && res.error) setMsg({ ok: false, text: res.error });
      else {
        setMsg({ ok: true, text: "Enregistré ✓" });
        router.refresh();
      }
    });

  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">
        Mets <strong>quranlab.app/telecharger</strong> dans ta bio TikTok/Instagram. Cette page
        redirige automatiquement chaque visiteur vers le bon store selon son téléphone. Laisse un
        champ vide = ce type d&apos;appareil ira vers le lien de secours.
      </p>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-neutral-600">
          Lien App Store (iPhone / iPad)
        </span>
        <input
          value={c.appStoreUrl}
          onChange={(e) => setC({ ...c, appStoreUrl: e.target.value })}
          placeholder="https://apps.apple.com/app/idXXXXXXXXX"
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-neutral-600">
          Lien Play Store (Android) — optionnel
        </span>
        <input
          value={c.playStoreUrl}
          onChange={(e) => setC({ ...c, playStoreUrl: e.target.value })}
          placeholder="https://play.google.com/store/apps/details?id=..."
          className={inputCls}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-neutral-600">
          Lien de secours (ordinateur, ou store non renseigné)
        </span>
        <input
          value={c.fallbackUrl}
          onChange={(e) => setC({ ...c, fallbackUrl: e.target.value })}
          placeholder="/comprendre-sa-priere"
          className={inputCls}
        />
        <span className="mt-1 block text-[11px] text-neutral-400">
          Chemin du site (ex. /comprendre-sa-priere) ou URL complète.
        </span>
      </label>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <a href="/telecharger" target="_blank" className="text-xs font-semibold text-[#6967fb] hover:underline">
          Tester /telecharger ↗
        </a>
        {msg && (
          <span className={`text-sm font-semibold ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</span>
        )}
      </div>
    </div>
  );
}
