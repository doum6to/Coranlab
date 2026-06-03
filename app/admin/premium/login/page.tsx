import { redirect } from "next/navigation";

import { isAdminAuthed } from "@/lib/admin-auth";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

const AdminLoginPage = () => {
  if (isAdminAuthed()) {
    redirect("/admin/premium");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-neutral-800">
          Espace admin
        </h1>
        <p className="mb-6 text-center text-sm text-neutral-500">
          Gestion des accès premium
        </p>
        <LoginForm />
      </div>
    </div>
  );
};

export default AdminLoginPage;
