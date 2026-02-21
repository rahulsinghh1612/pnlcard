import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "Profile — PNLCard",
  description: "Edit your profile and trading preferences.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, x_handle, currency, timezone, trading_capital, card_theme"
    )
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal info and trading preferences.
        </p>
      </div>

      <ProfileForm
        userId={user.id}
        initialData={{
          displayName: profile.display_name,
          xHandle: profile.x_handle ?? "",
          currency: profile.currency as "INR" | "USD",
          timezone: profile.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
          tradingCapital: profile.trading_capital?.toString() ?? "",
          cardTheme: (profile.card_theme as "light" | "dark") ?? "light",
        }}
      />
    </div>
  );
}
