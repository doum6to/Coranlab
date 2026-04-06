import { PageReveal } from "@/components/ui/page-reveal";

type Props = {
  children: React.ReactNode;
};

const LessonLayout = ({ children }: Props) => {
  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <PageReveal>{children}</PageReveal>
      </div>
    </div>
  );
};

export default LessonLayout;
