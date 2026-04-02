import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Google OAuth callback — exchanges the authorization code for an ID token,
 * then creates a Supabase session via signInWithIdToken.
 *
 * This bypasses Supabase's built-in OAuth redirect so the Supabase project URL
 * never appears in the Google consent screen or redirect chain.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // Read and immediately clean up OAuth cookies on every path
  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value;
  const nextRaw = cookieStore.get("google_oauth_next")?.value ?? null;
  cookieStore.delete("google_oauth_state");
  cookieStore.delete("google_oauth_next");

  const next = safeRedirect(nextRaw);

  // Google returned an error (e.g. user denied consent)
  if (errorParam) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // CSRF: validate state matches the cookie
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${origin}/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    const tokenData = await tokenRes.json();
    const idToken: string | undefined = tokenData.id_token;

    if (!idToken) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Create a Supabase session from the Google ID token
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    return NextResponse.redirect(`${origin}${next}`);
  } catch {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }
}
