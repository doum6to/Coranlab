import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/supabase/server";
import { UserButton } from "@/components/user-button";

export const Header = async () => {
  const { userId } = await auth();

  return (
    <header className="h-16 w-full px-4 sm:h-20 sm:px-6">
      <div className="mx-auto flex h-full items-center justify-between lg:max-w-[1040px]">
        <Link href="/" className="flex items-center">
          <Image src="/quranlab-logo.svg" alt="Quranlab" width={140} height={56} className="h-11 w-auto sm:h-14" priority />
        </Link>
        {userId ? (
          <UserButton />
        ) : (
          <Link href="/auth/login" className="flex h-11 items-center rounded-full px-4 text-[0.9375rem] font-semibold text-brilliant-text transition-colors hover:bg-neutral-100">
            Connexion
          </Link>
        )}
      </div>
    </header>
  );
};
