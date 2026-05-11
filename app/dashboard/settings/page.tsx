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

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, plan, plan_expires_at, trial_ends_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("subscriptions")
      .select("status, plan_type, current_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const accessStatus = getUserAccessStatus(
    profile ?? { plan: null, plan_expires_at: null, trial_ends_at: null }
  );
  const trialDaysRemaining = getTrialDaysRemaining(
    profile ?? { trial_ends_at: null }
  );
  const expiresAt = profile?.plan_expires_at;

  // Check subscription state: active = paid, authenticated = yearly trial awaiting first charge
  const hasActiveSubscription = subscription?.status === "active";
  const hasTrialSubscription = subscription?.status === "authenticated";
  const hasCancelledTrial =
    subscription?.status === "cancelled" &&
    subscription?.plan_type === "yearly" &&
    accessStatus === "trial";
  const isYearlyTrial = accessStatus === "trial" && subscription?.plan_type === "yearly";

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
                  : hasCancelledTrial
                    ? `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""} left of your yearly free trial. Your annual charge has been cancelled.`
                  : accessStatus === "trial"
                    ? `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""} left of your yearly free trial. Cancel before it ends to avoid the annual charge.`
                    : "No active plan. Subscribe to regain access."}
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
                  : "Free"}
            </span>
          </div>

          {isYearlyTrial && profile?.trial_ends_at && (
            <p className="text-xs text-muted-foreground">
              {hasCancelledTrial
                ? "Your yearly free trial stays active until "
                : "Your yearly free trial ends on "}
              {new Date(profile.trial_ends_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {hasCancelledTrial
                ? ". You will not be charged."
                : ". You&apos;ll be charged ₹1,999/year unless you cancel before then."}
            </p>
          )}

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

          {accessStatus === "expired" && (
            <UpgradeButton
              userEmail={user.email ?? ""}
              userName={profile?.display_name ?? ""}
            />
          )}

          {accessStatus === "subscribed" && hasActiveSubscription && (
            <CancelSubscriptionButton />
          )}

          {hasTrialSubscription && (
            <CancelSubscriptionButton mode="trial" />
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

      <p className="text-center text-xs text-muted-foreground/50">
        PnLCard v{process.env.NEXT_PUBLIC_APP_VERSION}
      </p>
    </div>
  );
}
