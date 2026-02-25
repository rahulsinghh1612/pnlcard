import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
