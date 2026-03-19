import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteAccountButton } from "./delete-account-button";
import { CancelSubscriptionButton } from "./cancel-subscription-button";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";
import { getUserAccessStatus, getTrialDaysRemaining } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings — PnLCard",
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
    .select("display_name, plan, plan_expires_at, trial_ends_at")
    .eq("id", user.id)
    .single();

  const accessStatus = getUserAccessStatus(
    profile ?? { plan: null, plan_expires_at: null, trial_ends_at: null }
  );
  const trialDaysRemaining = getTrialDaysRemaining(
    profile ?? { trial_ends_at: null }
  );
  const expiresAt = profile?.plan_expires_at;

  // Check subscription state: only show "Renews on" + Cancel when we have an active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const hasActiveSubscription = subscription?.status === "active";

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
                {accessStatus === "subscribed"
                  ? "You have access to all features."
                  : accessStatus === "trial"
                    ? `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""} remaining in your free trial.`
                    : "Your trial has ended. Subscribe to regain access."}
              </p>
            </div>
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                accessStatus === "subscribed"
                  ? "bg-amber-100 text-amber-700"
                  : accessStatus === "trial"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {accessStatus === "subscribed"
                ? "Pro"
                : accessStatus === "trial"
                  ? "Trial"
                  : "Trial Ended"}
            </span>
          </div>

          {accessStatus === "subscribed" && expiresAt && (
            <p className="text-xs text-muted-foreground">
              {hasActiveSubscription ? "Renews on " : "Access until "}
              {new Date(expiresAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          {accessStatus !== "subscribed" && (
            <UpgradeButton
              userEmail={user.email ?? ""}
              userName={profile?.display_name ?? ""}
            />
          )}

          {accessStatus === "subscribed" && hasActiveSubscription && (
            <CancelSubscriptionButton />
          )}

          {accessStatus === "subscribed" && !hasActiveSubscription && expiresAt && (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Your access continues until{" "}
                {new Date(expiresAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                . Resubscribing now will start a new billing period from today.
              </p>
              <UpgradeButton
                userEmail={user.email ?? ""}
                userName={profile?.display_name ?? ""}
              >
                Renew subscription
              </UpgradeButton>
            </div>
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
