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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-page">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-2">
            <div className="logo-capsule px-5 py-2 text-base font-semibold">
              Pnl Card
            </div>
          </Link>
          <span className="text-sm font-medium text-foreground/80">
            Log. Share. Grow.
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">
              Set up your profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Just a few details and you&apos;re good to go
            </p>
          </div>

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
