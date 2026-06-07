"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, UploadCloud, GripVertical } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { COURSE_VIDEO_BUCKET } from "@/lib/course-videos";
import {
  createVideoUploadUrl,
  saveCourseVideo,
  deleteCourseVideo,
  updateCourseVideo,
} from "@/actions/course-videos";

type Video = { id: number; title: string; position: number; storagePath: string };

export function VideosForm({ initial }: { initial: Video[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function onUpload() {
    setError(null);
    if (!title.trim()) return setError("Donne un titre à la vidéo.");
    if (!file) return setError("Choisis un fichier vidéo.");

    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      setProgress("Préparation…");
      const signed = await createVideoUploadUrl(ext);
      if ("error" in signed) throw new Error(signed.error);

      setProgress("Envoi du fichier vers Supabase…");
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from(COURSE_VIDEO_BUCKET)
        .uploadToSignedUrl(signed.path, signed.token, file, {
          contentType: file.type || "video/mp4",
        });
      if (upErr) throw new Error(upErr.message);

      setProgress("Enregistrement…");
      const saved = await saveCourseVideo({ title: title.trim(), storagePath: signed.path });
      if ("error" in saved) throw new Error(saved.error);

      setTitle("");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      setProgress(null);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Échec de l'upload.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Supprimer cette vidéo définitivement ?")) return;
    const r = await deleteCourseVideo(id);
    if ("error" in r) return alert(r.error);
    router.refresh();
  }

  async function onSaveMeta(v: Video, nextTitle: string, nextPos: number) {
    const r = await updateCourseVideo({ id: v.id, title: nextTitle, position: nextPos });
    if ("error" in r) alert(r.error);
    else router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Upload card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h3 className="mb-1 font-bold text-neutral-900">Ajouter une vidéo</h3>
        <p className="mb-4 text-sm text-neutral-500">
          Formation « Lire l&apos;arabe en 7h ». Le fichier est envoyé
          directement vers Supabase (pas de limite Vercel). Idéalement &lt; 2 Go,
          format MP4.
        </p>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre (ex : Chapitre 1 — Les lettres)"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <input
            ref={fileInput}
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          <button
            onClick={onUpload}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            {busy ? progress || "Envoi…" : "Uploader la vidéo"}
          </button>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-5 py-3">
          <h3 className="font-bold text-neutral-900">
            Vidéos en ligne ({initial.length})
          </h3>
        </div>
        {initial.length === 0 ? (
          <p className="px-5 py-6 text-sm text-neutral-500">
            Aucune vidéo pour l&apos;instant.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {initial.map((v) => (
              <VideoRow key={v.id} video={v} onDelete={onDelete} onSave={onSaveMeta} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function VideoRow({
  video,
  onDelete,
  onSave,
}: {
  video: Video;
  onDelete: (id: number) => void;
  onSave: (v: Video, title: string, pos: number) => void;
}) {
  const [title, setTitle] = useState(video.title);
  const [pos, setPos] = useState(String(video.position));
  const dirty = title !== video.title || pos !== String(video.position);

  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <GripVertical className="h-4 w-4 shrink-0 text-neutral-300" />
      <input
        value={pos}
        onChange={(e) => setPos(e.target.value)}
        className="w-14 rounded-lg border border-neutral-200 px-2 py-1 text-center text-sm"
      />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm"
      />
      {dirty && (
        <button
          onClick={() => onSave(video, title.trim(), parseInt(pos, 10) || 0)}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white"
        >
          Enregistrer
        </button>
      )}
      <button
        onClick={() => onDelete(video.id)}
        className="rounded-lg p-2 text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600"
        aria-label="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
