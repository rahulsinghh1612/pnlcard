import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/cron/downgrade-expired
 *
 * Cron job that downgrades users whose plan_expires_at has passed.
 * Keeps the database consistent: plan="premium" with past plan_expires_at
 * should be updated to plan="free", plan_expires_at=null.
 *
 * Secured by CRON_SECRET — Vercel sends it as Bearer token in Authorization.
 * Run daily (e.g. 6:00 UTC).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Admin client not available" },
      { status: 500 }
    );
  }

  const now = new Date().toISOString();

  const { data: expired, error } = await admin
    .from("profiles")
    .select("id")
    .eq("plan", "premium")
    .not("plan_expires_at", "is", null)
    .lt("plan_expires_at", now);

  if (error) {
    console.error("Error fetching expired profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch expired profiles" },
      { status: 500 }
    );
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ downgraded: 0, message: "No expired profiles" });
  }

  const ids = expired.map((p) => p.id);

  const { error: updateError } = await admin
    .from("profiles")
    .update({ plan: "free", plan_expires_at: null })
    .in("id", ids);

  if (updateError) {
    console.error("Error downgrading profiles:", updateError);
    return NextResponse.json(
      { error: "Failed to downgrade profiles" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    downgraded: ids.length,
    ids,
    message: `Downgraded ${ids.length} expired premium user(s)`,
  });
}
