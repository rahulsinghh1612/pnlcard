import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DashboardNav } from "./dashboard-nav";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";
import { PnLCardLogo } from "@/components/ui/pnlcard-logo";
import { Sparkles } from "lucide-react";
import { isPremiumUser } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  const hasPremium = isPremiumUser(profile);

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <div className="logo-capsule px-3 py-1.5 text-sm">
                <PnLCardLogo size={18} />
              </div>
            </Link>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Log daily results
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/debrief"
              className="group inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 text-sm font-semibold text-amber-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100/80 hover:shadow"
            >
              <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
              Review
            </Link>
            {!hasPremium && (
              <UpgradeButton
                userEmail={user.email ?? ""}
                userName={profile?.display_name ?? "User"}
                dropdownAlign="right"
                variant="header"
                className="btn-gradient-flow group inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            )}
            <DashboardNav displayName={profile?.display_name ?? "User"} plan={hasPremium ? "premium" : "free"} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
