import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";
import { NextResponse } from "next/server";

/**
 * Handles auth callbacks from Supabase:
 * - Email confirmation — uses `token_hash` + `type`, verifyOtp
 *
 * Google OAuth is handled separately at /auth/google/callback.
 *
 * Configure in Supabase: Authentication → URL Configuration → Redirect URLs
 * Add: http://localhost:3000/auth/callback (dev) and https://pnlcard.com/auth/callback (prod)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeRedirect(searchParams.get("next"));

  // Email confirmation flow (signup, magic link, recovery)
  if (tokenHash && type) {
    const supabase = await createClient();
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
