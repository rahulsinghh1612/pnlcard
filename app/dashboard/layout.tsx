import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DashboardNav } from "./dashboard-nav";

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
    .select("display_name, plan")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-foreground"
          >
            <svg className="h-8 w-8 shrink-0 shadow-md rounded-[8px]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="logo-clip">
                  <rect width="40" height="40" rx="10" />
                </clipPath>
              </defs>
              <g clipPath="url(#logo-clip)">
                <rect width="40" height="40" fill="#18181b" />
                <polygon points="0,0 40,0 0,40" fill="#22c55e" opacity="0.9" />
                <polygon points="40,0 40,40 0,40" fill="#ef4444" opacity="0.9" />
              </g>
              <text x="50%" y="54%" dominantBaseline="central" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="700" fill="white">P</text>
            </svg>
            <span className="text-[15px] font-semibold tracking-tight">
              PnL<span className="font-normal">Card</span>
            </span>
          </Link>

          <DashboardNav displayName={profile?.display_name ?? "User"} plan={(profile?.plan as "free" | "premium") ?? "free"} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
