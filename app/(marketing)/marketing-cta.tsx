"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShinyButton } from "@/components/ui/shiny-button";

export const MarketingCTA = () => {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthed(!!data.user);
    });
  }, []);

  // Optimistic render: show "Commencer" by default, upgrades to
  // "Continuer à apprendre" once we know the user is logged in.
  if (isAuthed) {
    return (
      <Link href="/learn" className="w-full">
        <ShinyButton variant="green">Continuer à apprendre</ShinyButton>
      </Link>
    );
  }

  return (
    <>
      <Link href="/onboarding" className="w-full">
        <ShinyButton variant="green">Commencer</ShinyButton>
      </Link>
      <Link href="/auth/login" className="w-full">
        <ShinyButton variant="outline-green">J&apos;ai déjà un compte</ShinyButton>
      </Link>
    </>
  );
};
