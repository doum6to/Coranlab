import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export const Promo = () => {
  return (
    <div className="border border-brilliant-border rounded-2xl p-4 space-y-4 bg-white">
      <div className="space-y-2">
        <div className="flex items-center gap-x-2">
          <Image
            src="/unlimited.svg"
            alt="Pro"
            height={26}
            width={26}
          />
          <h3 className="font-bold text-lg text-brilliant-text">
            Passer en Pro
          </h3>
        </div>
        <p className="text-brilliant-muted text-sm">
          Clés illimitées + tous les cours débloqués !
        </p>
      </div>
      <Button
        asChild
        variant="super"
        className="w-full"
        size="lg"
      >
        <Link href="/shop">
          Améliorer aujourd&apos;hui
        </Link>
      </Button>
    </div>
  );
};
