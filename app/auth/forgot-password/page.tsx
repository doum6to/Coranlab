import { ForgotPasswordForm } from "./forgot-password-form";

// Dynamic so the locale (cookie / Accept-Language) is resolved server-side.
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
