import { ResetPasswordForm } from "./reset-password-form";

// Dynamic so the locale (cookie / Accept-Language) is resolved server-side.
export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
