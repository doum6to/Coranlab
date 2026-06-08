import { PageReveal } from "@/components/ui/page-reveal";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getRequestLocale } from "@/lib/i18n/request-locale";

type Props = {
  children: React.ReactNode;
};

const LessonLayout = ({ children }: Props) => {
  const locale = getRequestLocale();
  return (
    <LocaleProvider locale={locale}>
      <div className="flex flex-col h-[100dvh]">
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <PageReveal>{children}</PageReveal>
        </div>
      </div>
    </LocaleProvider>
  );
};

export default LessonLayout;
