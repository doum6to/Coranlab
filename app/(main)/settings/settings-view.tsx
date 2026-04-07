"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { LogOut, CreditCard, Crown, Mail, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createStripeUrl } from "@/actions/user-subscription";

type Props = {
  userName: string;
  email: string;
  isPro: boolean;
  subscriptionEndDate: string | null;
  hasStripeCustomer: boolean;
};

export const SettingsView = ({
  userName,
  email,
  isPro,
  subscriptionEndDate,
  hasStripeCustomer,
}: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleManageSubscription = () => {
    startTransition(() => {
      createStripeUrl()
        .then((response) => {
          if ("error" in response) {
            toast.error(response.error);
          } else if (response.data) {
            window.location.href = response.data;
          }
        })
        .catch(() => {
          toast.error("Une erreur est survenue");
        });
    });
  };

  const formattedEndDate = subscriptionEndDate
    ? new Date(subscriptionEndDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="px-4 sm:px-6 pb-10">
      <h1 className="text-2xl font-bold text-brilliant-text mb-6">
        Paramètres
      </h1>

      <div className="space-y-6 max-w-xl">
        {/* Account Section */}
        <section className="rounded-2xl border border-brilliant-border bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-brilliant-border">
            <h2 className="text-sm font-bold text-brilliant-text uppercase tracking-wide">
              Compte
            </h2>
          </div>

          <div className="divide-y divide-brilliant-border">
            {/* Name */}
            <div className="px-5 py-4 flex items-center gap-x-3">
              <User className="h-5 w-5 text-brilliant-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-brilliant-muted">Nom</p>
                <p className="text-sm font-semibold text-brilliant-text truncate">
                  {userName}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="px-5 py-4 flex items-center gap-x-3">
              <Mail className="h-5 w-5 text-brilliant-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-brilliant-muted">E-mail</p>
                <p className="text-sm font-semibold text-brilliant-text truncate">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="rounded-2xl border border-brilliant-border bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-brilliant-border">
            <h2 className="text-sm font-bold text-brilliant-text uppercase tracking-wide">
              Abonnement
            </h2>
          </div>

          <div className="px-5 py-5">
            {isPro ? (
              <div className="space-y-4">
                {/* Active subscription badge */}
                <div className="flex items-center gap-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #F7C325 0%, #E350E3 35%, #874DE5 65%, #456DFF 100%)",
                    }}
                  >
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brilliant-text">
                      Premium actif
                    </p>
                    {formattedEndDate && (
                      <p className="text-xs text-brilliant-muted">
                        Prochain renouvellement le {formattedEndDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Manage subscription button */}
                {hasStripeCustomer && (
                  <button
                    onClick={handleManageSubscription}
                    disabled={pending}
                    className="w-full flex items-center justify-center gap-x-2 rounded-xl py-3 text-sm font-bold text-brilliant-text border-2 border-brilliant-border hover:bg-gray-50 transition disabled:opacity-60"
                  >
                    <CreditCard className="h-4 w-4" />
                    {pending
                      ? "Chargement..."
                      : "Gérer mon abonnement"}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Crown className="h-5 w-5 text-brilliant-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brilliant-text">
                      Plan gratuit
                    </p>
                    <p className="text-xs text-brilliant-muted">
                      Accès limité aux leçons
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/premium")}
                  className="w-full rounded-xl py-3 text-sm font-bold text-white text-center transition hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] animate-premium-gradient"
                  style={{
                    background:
                      "linear-gradient(90deg, #050C38 0%, #6700A3 25%, #E02F75 50%, #FF5A57 75%, #050C38 100%)",
                    backgroundSize: "400% 100%",
                    boxShadow: "0 3px 0 0 rgba(5, 12, 56, 0.4)",
                  }}
                >
                  Passer à Premium
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Sign out */}
        <section className="rounded-2xl border border-brilliant-border bg-white overflow-hidden">
          <button
            onClick={handleSignOut}
            className="w-full px-5 py-4 flex items-center gap-x-3 text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-semibold">Déconnexion</span>
          </button>
        </section>
      </div>
    </div>
  );
};
