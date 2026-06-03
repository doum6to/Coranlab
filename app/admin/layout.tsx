import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Passthrough layout — only adds noindex to the whole /admin area. Must not
// wrap children in extra markup: the existing React-Admin SPA at /admin
// renders its own full layout.
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default AdminLayout;
