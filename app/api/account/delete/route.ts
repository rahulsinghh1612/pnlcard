import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeBillingEmail } from "@/lib/billing";

/**
 * POST /api/account/delete
 *
 * Fully deletes a user's account:
 * 1. Deletes trades (via admin to bypass RLS edge cases)
 * 2. Deletes subscriptions
 * 3. Deletes profile
 * 4. Deletes the user from auth.users (requires admin/service role)
 *
 * The client SDK can't delete auth users — only the admin API can.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const normalizedEmail = normalizeBillingEmail(user.email ?? null);

    if (normalizedEmail) {
      const [{ data: profile }, { data: subscription }, { data: billingCustomer }] =
        await Promise.all([
        admin
          .from("profiles")
          .select("trial_ends_at, yearly_trial_used_at, plan_expires_at")
          .eq("id", user.id)
          .maybeSingle(),
        admin
          .from("subscriptions")
          .select("provider, provider_subscription_id, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        admin
          .from("billing_customers")
          .select("yearly_trial_used_at, first_paid_at")
          .eq("normalized_email", normalizedEmail)
          .maybeSingle(),
      ]);

      await admin.from("billing_customers").upsert(
        {
          normalized_email: normalizedEmail,
          latest_auth_user_id: user.id,
          latest_profile_id: user.id,
          yearly_trial_used_at:
            billingCustomer?.yearly_trial_used_at ??
            profile?.yearly_trial_used_at ??
            (profile?.trial_ends_at ? new Date().toISOString() : null),
          first_paid_at:
            billingCustomer?.first_paid_at ??
            (profile?.plan_expires_at ? new Date().toISOString() : null),
          latest_provider: subscription?.provider ?? "razorpay",
          latest_provider_subscription_id:
            subscription?.provider_subscription_id ?? null,
          last_known_status: subscription?.status ?? "deleted_account",
          deleted_account_at: new Date().toISOString(),
        },
        { onConflict: "normalized_email" }
      );
    }

    // Delete all user data
    await admin.from("trades").delete().eq("user_id", user.id);
    await admin.from("subscriptions").delete().eq("user_id", user.id);
    await admin.from("profiles").delete().eq("id", user.id);

    // Delete the user from auth.users — this is the critical step
    const { error: authError } = await admin.auth.admin.deleteUser(user.id);

    if (authError) {
      console.error("Failed to delete auth user:", authError);
      return NextResponse.json(
        { error: "Failed to delete account. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "deleted" });
  } catch (error: unknown) {
    console.error("Error deleting account:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
