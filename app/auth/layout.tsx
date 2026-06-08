import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getRequestLocale } from "@/lib/i18n/request-locale";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const locale = getRequestLocale();
  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
};

export default AuthLayout;
