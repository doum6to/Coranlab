import { X } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useExitModal } from "@/store/use-exit-modal";

type Props = {
  hearts: number;
  percentage: number;
  hasActiveSubscription: boolean;
};

export const Header = ({
  hearts,
  percentage,
  hasActiveSubscription,
}: Props) => {
  const { open } = useExitModal();

  return (
    <header className="lg:pt-[50px] pt-[12px] pb-[8px] shrink-0 px-4 sm:px-10 flex gap-x-4 sm:gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full">
      <X
        onClick={open}
        className="text-brilliant-muted hover:opacity-75 transition cursor-pointer shrink-0"
      />
      <Progress value={percentage} />
    </header>
  );
};
