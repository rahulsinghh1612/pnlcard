import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { OnboardingForm } from "./onboarding-form";

export const metadata = {
  title: "Get started — PNLCard",
  description: "Set up your PNLCard profile.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-page">
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
          <Link href="/">
            <div className="logo-capsule px-4 py-1.5 text-sm">Pnl Card</div>
          </Link>
          <span className="ml-3 hidden sm:inline text-sm text-muted-foreground">
            Log. Share. Grow.
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-lg px-6 py-16 sm:py-24">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 ring-1 ring-emerald-200/50">
            <svg
              className="h-6 w-6 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Set up your profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            Just a few details and you&apos;re good to go
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <OnboardingForm userId={user.id} />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can update these anytime in{" "}
          <span className="font-medium text-foreground/70">Settings</span>.
        </p>
      </div>
    </main>
  );
}
