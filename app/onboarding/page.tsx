import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
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

  // Check if profile already exists — if so, go to dashboard
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
        <div className="mb-8 text-center">
          <div className="logo-capsule px-5 py-2 text-lg mb-2">
            Pnl Card
          </div>
          <p className="text-sm text-muted-foreground mb-4">Log. Share. Grow.</p>
          <h1 className="text-2xl font-semibold text-foreground">
            Set up your profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            A few quick details to get you started
          </p>
        </div>

        <Card className="p-8">
          <OnboardingForm userId={user.id} />
        </Card>
      </div>
    </main>
  );
}
