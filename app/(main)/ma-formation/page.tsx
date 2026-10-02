import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, PlayCircle } from "lucide-react";

import { auth } from "@/lib/supabase/server";
import { userHasArabicCourse, getArabicCourseVideos } from "@/lib/arabic-course";
import { CoursePlayer } from "./course-player";
import { getServerStrings } from "@/lib/i18n/server-t";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const { t } = getServerStrings();
  return { title: t.training.metaTitle };
}

export default async function MaFormationPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/login");

  const { t } = getServerStrings();
  const hasAccess = await userHasArabicCourse();

  if (!hasAccess) {
    return (
      <div className="px-4 sm:px-6 pb-16">
        <div className="mx-auto mt-8 max-w-lg rounded-3xl border border-brilliant-border bg-white p-8 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold text-brilliant-text">
            {t.training.lockedTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brilliant-muted">
            {t.training.lockedBody}
          </p>
          <Link
            href="/lire-larabe"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border-b-4 border-[#a9801f] bg-gradient-to-b from-[#e9c15a] to-[#d9a93c] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-neutral-900 transition hover:brightness-105 active:translate-y-1 active:border-b-0"
          >
            {t.training.discover}
          </Link>
        </div>
      </div>
    );
  }

  const videos = await getArabicCourseVideos();

  if (videos.length === 0) {
    return (
      <div className="px-4 sm:px-6 pb-16">
        <div className="mx-auto mt-8 max-w-lg rounded-3xl border border-brilliant-border bg-white p-8 text-center">
          <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#6967fb]/10 text-[#6967fb]">
            <PlayCircle className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold text-brilliant-text">
            {t.training.soonTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brilliant-muted">
            {t.training.soonBody}
          </p>
        </div>
      </div>
    );
  }

  return <CoursePlayer videos={videos} />;
}
