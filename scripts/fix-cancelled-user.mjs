#!/usr/bin/env node
/**
 * One-time script: Restore premium access for a user who was incorrectly
 * downgraded when they cancelled (before we fixed the cancel flow).
 *
 * Usage: node scripts/fix-cancelled-user.mjs <email>
 * Example: node scripts/fix-cancelled-user.mjs rahulsinghh1612@gmail.com
 *
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/fix-cancelled-user.mjs <email>");
  process.exit(1);
}

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
try {
  const content = readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
} catch (e) {
  console.error("Could not load .env.local:", e.message);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  // 1. Find user by email (auth.users)
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });

  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  const user = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  console.log(`Found user: ${user.id} (${user.email})`);

  // 2. Get their subscription (most recent)
  const { data: subs, error: subError } = await supabase
    .from("subscriptions")
    .select("id, current_period_end, current_period_start, plan_type, created_at, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (subError) {
    console.error("Failed to fetch subscription:", subError.message);
    process.exit(1);
  }

  const sub = subs?.[0];
  let periodEnd;

  if (sub) {
    // Determine period end: use stored value, or infer from start/created + plan_type
    periodEnd = sub.current_period_end;
    if (!periodEnd) {
      const base = sub.current_period_start || sub.created_at;
      if (base) {
        const baseDate = new Date(base);
        const isYearly = sub.plan_type === "yearly";
        baseDate.setMonth(baseDate.getMonth() + (isYearly ? 12 : 1));
        periodEnd = baseDate.toISOString();
        console.log(`Inferred period end from ${sub.plan_type} plan: ${periodEnd}`);
      }
    }
  }

  // Fallback: no subscription or no period data — use end of current month
  if (!periodEnd) {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    periodEnd = endOfMonth.toISOString();
    console.log(`No subscription data found. Using end of current month: ${periodEnd}`);
  }
  const periodEndDate = new Date(periodEnd);
  if (periodEndDate <= new Date()) {
    console.error(`Subscription period already ended (${periodEnd}). Nothing to fix.`);
    process.exit(1);
  }

  console.log(`Subscription period ends: ${periodEnd}`);

  // 3. Get current profile state
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Failed to fetch profile:", profileError?.message || "No profile");
    process.exit(1);
  }

  if (profile.plan === "premium" && profile.plan_expires_at && new Date(profile.plan_expires_at) > new Date()) {
    console.log("Profile already has premium access until", profile.plan_expires_at);
    console.log("No fix needed.");
    process.exit(0);
  }

  // 4. Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ plan: "premium", plan_expires_at: periodEnd })
    .eq("id", user.id);

  if (updateError) {
    console.error("Failed to update profile:", updateError.message);
    process.exit(1);
  }

  console.log("Done. Profile updated: plan=premium, plan_expires_at=" + periodEnd);
  console.log("User will retain premium access until", periodEnd);
}

main();
