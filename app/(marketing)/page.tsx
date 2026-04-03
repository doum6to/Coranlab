import Image from "next/image";
import Link from "next/link";
import { ShinyButton } from "@/components/ui/shiny-button";
import { auth } from "@/lib/supabase/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="max-w-[988px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center px-6 sm:px-8 py-8 gap-8 lg:gap-12">
      <div className="relative w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] lg:w-[400px] lg:h-[400px] shrink-0">
        <Image
          src="/hero.png"
          fill
          alt="Quranlab"
          className="object-contain"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>
      <div className="flex flex-col items-center gap-y-6 sm:gap-y-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brilliant-text max-w-[480px] text-center leading-tight font-heading">
          Apprends, pratique et maîtrise 85% des mots du Coran.
        </h1>
        <div className="flex flex-col items-center gap-y-3 max-w-[330px] w-full">
          {userId ? (
            <Link href="/learn" className="w-full">
              <ShinyButton variant="green">
                Continuer à apprendre
              </ShinyButton>
            </Link>
          ) : (
            <>
              <Link href="/auth/signup" className="w-full">
                <ShinyButton variant="green">
                  Commencer
                </ShinyButton>
              </Link>
              <Link href="/auth/login" className="w-full">
                <ShinyButton variant="outline-green">
                  J&apos;ai déjà un compte
                </ShinyButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
