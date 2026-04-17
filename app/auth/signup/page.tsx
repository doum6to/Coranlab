import { Suspense } from "react";

import { SignUpForm } from "./signup-form";

export const dynamic = "force-static";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
