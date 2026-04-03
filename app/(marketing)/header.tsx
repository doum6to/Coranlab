import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/supabase/server";
import { UserButton } from "@/components/user-button";

export const Header = async () => {
  const { userId } = await auth();

  return (
    <header className="h-20 w-full border-b border-brilliant-border px-4 sm:px-6">
      <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
        <Link href="/" className="pt-8 pl-4 pb-7 flex items-center gap-x-2">
          <h1 className="text-2xl font-extrabold text-brilliant-text tracking-wide font-heading">
            Quranlab
          </h1>
        </Link>
        {userId ? (
          <UserButton />
        ) : (
          <Link href="/auth/login">
            <Button size="lg" variant="ghost">
              Connexion
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};
