import { LoginForm } from "./login-form";

// Dynamic so the locale (cookie / Accept-Language) is resolved server-side.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginForm />;
}
