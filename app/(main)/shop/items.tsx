"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { claimDailyKey } from "@/actions/user-progress";
import { createStripeUrl } from "@/actions/user-subscription";

type Props = {
  keys: number;
  points: number;
  hasActiveSubscription: boolean;
  canClaimKey: boolean;
};

export const Items = ({
  keys,
  points,
  hasActiveSubscription,
  canClaimKey,
}: Props) => {
  const [pending, startTransition] = useTransition();

  const onClaimKey = () => {
    if (pending || !canClaimKey) return;

    startTransition(() => {
      claimDailyKey()
        .then(() => toast.success("Clé récupérée !"))
        .catch(() => toast.error("Une erreur est survenue"));
    });
  };

  const onUpgrade = () => {
    startTransition(() => {
      createStripeUrl()
        .then((response) => {
          if (response.data) {
            window.location.href = response.data;
          }
        })
        .catch(() => toast.error("Une erreur est survenue"));
    });
  };

  return (
    <ul className="w-full">
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image
          src="/key.svg"
          alt="Clé"
          height={60}
          width={60}
        />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Clé quotidienne
          </p>
          <p className="text-sm text-muted-foreground">
            {canClaimKey ? "Récupère ta clé gratuite du jour" : "Reviens demain pour une nouvelle clé"}
          </p>
        </div>
        <Button
          onClick={onClaimKey}
          disabled={pending || !canClaimKey}
        >
          {canClaimKey ? "Récupérer" : "Récupérée ✓"}
        </Button>
      </div>
      <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
        <Image
          src="/unlimited.svg"
          alt="Unlimited"
          height={60}
          width={60}
        />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Quranlab Pro
          </p>
          <p className="text-sm text-muted-foreground">
            Clés illimitées + tous les cours débloqués
          </p>
        </div>
        <Button
          onClick={onUpgrade}
          disabled={pending}
        >
          {hasActiveSubscription ? "Paramètres" : "Passer Pro"}
        </Button>
      </div>
    </ul>
  );
};
