import { Suspense } from "react";

import { SignUpForm } from "./signup-form";

// Dynamic so the locale (cookie / Accept-Language) is resolved server-side.
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
