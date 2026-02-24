import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Handles auth callbacks from Supabase:
 * 1. OAuth (Google) — uses `code`, exchangeCodeForSession
 * 2. Email confirmation — uses `token_hash` + `type`, verifyOtp
 *
 * Configure in Supabase: Authentication → URL Configuration → Redirect URLs
 * Add: http://localhost:3000/auth/callback (dev) and https://pnlcard.com/auth/callback (prod)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  // OAuth flow (Google sign-in)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Email confirmation flow (signup, magic link, recovery)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "email" | "recovery" | "invite" | "magiclink",
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
