import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";

export const MobileSidebar = ({ hasArabicCourse }: { hasArabicCourse?: boolean }) => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="text-brilliant-text" />
      </SheetTrigger>
      <SheetContent className="p-0 z-[100]" side="left">
        <Sidebar hasArabicCourse={hasArabicCourse} />
      </SheetContent>
    </Sheet>
  );
};
