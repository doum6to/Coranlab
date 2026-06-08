import Link from "next/link";
import Image from "next/image";

import { quests } from "@/constants";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getServerStrings } from "@/lib/i18n/server-t";
import { tpl } from "@/lib/i18n/locales";

type Props = {
  points: number;
};

export const Quests = ({ points }: Props) => {
  const { t } = getServerStrings();
  return (
    <div className="border border-brilliant-border rounded-2xl p-4 space-y-4 bg-white">
      <div className="flex items-center justify-between w-full space-y-2">
        <h3 className="font-bold text-lg text-brilliant-text">
          {t.quests.title}
        </h3>
        <Link href="/quests">
          <Button
            size="sm"
            variant="primaryOutline"
          >
            {t.common.seeAll}
          </Button>
        </Link>
      </div>
      <ul className="w-full space-y-4">
        {quests.map((quest) => {
          const progress = (points / quest.value) * 100;

          return (
            <div
              className="flex items-center w-full pb-4 gap-x-3"
              key={quest.title}
            >
              <Image
                src="/points.svg"
                alt="Points"
                width={40}
                height={40}
              />
              <div className="flex flex-col gap-y-2 w-full">
                <p className="text-neutral-700 text-sm font-bold">
                  {tpl(t.quests.earnXp, { n: quest.value })}
                </p>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          )
        })}
      </ul>
    </div>
  );
};
