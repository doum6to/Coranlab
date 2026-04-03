"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const SidebarItem = ({
  label,
  icon: Icon,
  href,
}: Props) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Button
      variant={active ? "sidebarOutline" : "sidebar"}
      className="justify-start h-[52px]"
      asChild
    >
      <Link href={href}>
        <Icon className="w-7 h-7 mr-5" />
        {label}
      </Link>
    </Button>
  );
};
