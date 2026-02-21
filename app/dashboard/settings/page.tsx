import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteAccountButton } from "./delete-account-button";

export const metadata = {
  title: "Settings — PNLCard",
  description: "Manage your account settings.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan as "free" | "premium") ?? "free";
  const expiresAt = profile?.plan_expires_at;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account and billing.
        </p>
      </div>

      {/* Email */}
      <Card>
        <CardContent className="pt-6 space-y-1">
          <h2 className="text-sm font-medium text-foreground">Email address</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground pt-1">
            This is the email linked to your account. It cannot be changed.
          </p>
        </CardContent>
      </Card>

      {/* Plan & Billing */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-foreground">Plan</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {plan === "premium"
                  ? "You have access to all features."
                  : "Upgrade to unlock weekly & monthly cards."}
              </p>
            </div>
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                plan === "premium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {plan === "premium" ? "Premium" : "Free"}
            </span>
          </div>

          {plan === "premium" && expiresAt && (
            <p className="text-xs text-muted-foreground">
              Renews on{" "}
              {new Date(expiresAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          {plan === "free" && (
            <button
              type="button"
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Upgrade to Premium
            </button>
          )}
        </CardContent>
      </Card>

      {/* Delete account */}
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  );
}
