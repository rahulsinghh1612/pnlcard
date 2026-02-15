import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Handles OAuth callback from Supabase (Google sign-in).
 * Exchanges the auth code for a session, then redirects to dashboard.
 *
 * Configure the callback URL in Supabase Dashboard:
 * Authentication → URL Configuration → Redirect URLs
 * Add: http://localhost:3000/auth/callback (dev) and https://pnlcard.com/auth/callback (prod)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
