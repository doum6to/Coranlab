"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const UserButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button onClick={handleSignOut} variant="ghost" size="sm" className="gap-x-2">
      <LogOut className="h-4 w-4" />
      Déconnexion
    </Button>
  );
};
