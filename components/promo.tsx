import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { getServerStrings } from "@/lib/i18n/server-t";

export const Promo = () => {
  const { t } = getServerStrings();
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
            {t.promo.title}
          </h3>
        </div>
        <p className="text-brilliant-muted text-sm">
          {t.promo.body}
        </p>
      </div>
      <Button
        asChild
        variant="super"
        className="w-full"
        size="lg"
      >
        <Link href="/shop">
          {t.promo.cta}
        </Link>
      </Button>
    </div>
  );
};
