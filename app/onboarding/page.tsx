import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 items-center justify-center text-white text-xl font-bold mb-4">
            P
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Set up your profile
          </h1>
          <p className="mt-2 text-zinc-500">
            A few quick details to get you started
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <OnboardingForm userId={user.id} />
        </div>
      </div>
    </main>
  );
}
