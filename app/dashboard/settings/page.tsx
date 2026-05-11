import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteAccountButton } from "./delete-account-button";
import { CancelSubscriptionButton } from "./cancel-subscription-button";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";
import { getBillingStateDetails } from "@/lib/utils";
import { CalendarDays, CreditCard, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings — PnLCard",
  description: "Manage your account settings.",
};

function formatDateLabel(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, plan, plan_expires_at, trial_ends_at, yearly_trial_used_at")
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

  const billing = getBillingStateDetails(
    profile ?? { plan: null, plan_expires_at: null, trial_ends_at: null },
    subscription ?? null
  );
  const accessStatus = billing.accessStatus;
  const trialDaysRemaining = billing.trialDaysRemaining;
  const expiresAt = profile?.plan_expires_at;
  const trialEndsAt = profile?.trial_ends_at;
  const hasUsedYearlyTrial = profile?.yearly_trial_used_at != null;
  const formattedTrialEndDate = formatDateLabel(trialEndsAt);
  const formattedExpiresAt = formatDateLabel(expiresAt);

  const billingSummary =
    billing.billingState === "subscribed_active"
      ? {
          title: "Your Pro subscription is active.",
          tone: "amber" as const,
          badge: "PRO",
          detailRows: [
            {
              icon: CalendarDays,
              label: "Renews on",
              value: formattedExpiresAt ?? "Active",
            },
            {
              icon: CreditCard,
              label: "Next billing",
              value:
                subscription?.plan_type === "yearly"
                  ? "₹1,999/year"
                  : "₹249/month",
            },
          ],
          body: "All premium features are unlocked and your subscription will renew automatically unless you cancel.",
        }
      : billing.billingState === "subscribed_cancelled"
        ? {
            title: "Your Pro subscription has been cancelled.",
            tone: "amber" as const,
            badge: "PRO",
            detailRows: [
              {
                icon: CalendarDays,
                label: "Access until",
                value: formattedExpiresAt ?? "Current period end",
              },
              {
                icon: ShieldCheck,
                label: "Renewal",
                value: "Off",
              },
            ],
            body: "You still have full access until the date above. Resubscribing now starts a new billing period immediately.",
          }
      : billing.billingState === "payment_retry"
        ? {
            title: "We’re retrying your subscription payment.",
            tone: "amber" as const,
            badge: "ACTION",
            detailRows: [
              {
                icon: CalendarDays,
                label: "Access until",
                value: formattedExpiresAt ?? "Current period end",
              },
              {
                icon: CreditCard,
                label: "Subscription status",
                value: "Payment retry in progress",
              },
            ],
            body: "Your billing ran into an issue. Access is still available for now, but you should resubscribe or update payment approval before the current period ends.",
          }
        : billing.billingState === "payment_halted"
          ? {
              title: "Your subscription is on hold.",
              tone: "amber" as const,
              badge: "ACTION",
              detailRows: [
                {
                  icon: CalendarDays,
                  label: "Access until",
                  value: formattedExpiresAt ?? "Current period end",
                },
                {
                  icon: ShieldCheck,
                  label: "Subscription status",
                  value: "Halted",
                },
              ],
              body: "Auto-renewal is no longer progressing. Resubscribe to keep access from dropping off unexpectedly.",
            }
          : billing.billingState === "subscription_paused"
            ? {
                title: "Your subscription is paused.",
                tone: "amber" as const,
                badge: "PAUSED",
                detailRows: [
                  {
                    icon: CalendarDays,
                    label: "Access until",
                    value: formattedExpiresAt ?? "Current period end",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Subscription status",
                    value: "Paused",
                  },
                ],
                body: "Your plan is not actively renewing right now. Resubscribe whenever you’re ready to continue.",
              }
            : billing.billingState === "trial_active"
          ? {
              title: "Your yearly free trial is active.",
              tone: "blue" as const,
              badge: "TRIAL",
              detailRows: [
                {
                  icon: CalendarDays,
                  label: "Trial ends on",
                  value: formattedTrialEndDate ?? "End date unavailable",
                },
                {
                  icon: CreditCard,
                  label: "Upcoming charge",
                  value: "₹1,999/year unless cancelled",
                },
              ],
              body:
                trialDaysRemaining <= 1
                  ? "Your trial is ending very soon. If you do nothing, the yearly plan will begin automatically."
                  : "Cancel before the date above to avoid the annual charge. If you cancel now, you will still keep access until the end date.",
            }
          : billing.billingState === "trial_cancelled"
            ? {
                title: "Your yearly free trial has been cancelled.",
                tone: "blue" as const,
                badge: "TRIAL",
                detailRows: [
                  {
                    icon: CalendarDays,
                    label: "Access until",
                    value: formattedTrialEndDate ?? "End date unavailable",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Upcoming charge",
                    value: "Cancelled",
                  },
                ],
                body: "You still have access until the date above, and the annual charge will not go through.",
              }
            : {
                title: "You are currently on the free plan.",
                tone: "neutral" as const,
                badge: "FREE",
                detailRows: [
                  {
                    icon: CreditCard,
                    label: "Monthly plan",
                    value: "₹249/month",
                  },
                  {
                    icon: CalendarDays,
                    label: "Yearly plan",
                    value: hasUsedYearlyTrial
                      ? "₹1,999/year • starts immediately"
                      : "₹1,999/year • 7-day free trial",
                  },
                ],
                body: "Upgrade any time to unlock premium cards, reviews, and uninterrupted access.",
              };

  const billingToneClasses =
    billingSummary.tone === "amber"
      ? "border-amber-200 bg-amber-50/60"
      : billingSummary.tone === "blue"
        ? "border-blue-200 bg-blue-50/60"
        : "border-border bg-muted/30";

  const billingBadgeClasses =
    billingSummary.tone === "amber"
      ? "bg-amber-100 text-amber-700"
      : billingSummary.tone === "blue"
        ? "bg-blue-100 text-blue-700"
        : "bg-red-100 text-red-700";

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
                Current status and billing details.
              </p>
            </div>
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${billingBadgeClasses}`}
            >
              {billingSummary.badge}
            </span>
          </div>

          <div className={`space-y-4 rounded-xl border p-4 ${billingToneClasses}`}>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                {billingSummary.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {billingSummary.body}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {billingSummary.detailRows.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/70 bg-white/70 px-3 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {hasUsedYearlyTrial && accessStatus === "expired" && (
              <p className="text-xs text-muted-foreground">
                Your yearly free trial has already been used, so any new yearly plan will begin billing immediately.
              </p>
            )}

            {accessStatus === "subscribed" && billing.hasCancelledSubscription && hasUsedYearlyTrial && (
              <p className="text-xs text-muted-foreground">
                Your yearly free trial has already been used, so any new yearly plan will begin billing immediately.
              </p>
            )}

            <div className="space-y-2">
              {billing.canCancelTrial && <CancelSubscriptionButton mode="trial" />}

              {accessStatus === "subscribed" && billing.hasActiveSubscription && (
                <CancelSubscriptionButton />
              )}

              {(billing.hasPaymentRetryIssue || billing.hasPaymentHaltedIssue || billing.isPausedSubscription) && (
                <UpgradeButton
                  userEmail={user.email ?? ""}
                  userName={profile?.display_name ?? ""}
                >
                  Resubscribe now
                </UpgradeButton>
              )}

              {billing.hasCancelledTrial && (
                <UpgradeButton
                  userEmail={user.email ?? ""}
                  userName={profile?.display_name ?? ""}
                >
                  Resubscribe now
                </UpgradeButton>
              )}

              {accessStatus === "expired" && (
                <UpgradeButton
                  userEmail={user.email ?? ""}
                  userName={profile?.display_name ?? ""}
                />
              )}

              {accessStatus === "subscribed" && billing.hasCancelledSubscription && (
                <UpgradeButton
                  userEmail={user.email ?? ""}
                  userName={profile?.display_name ?? ""}
                >
                  Renew subscription
                </UpgradeButton>
              )}
            </div>
          </div>
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
