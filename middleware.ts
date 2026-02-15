import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware runs on every request. It:
 * 1. Refreshes the auth session (keeps tokens valid)
 * 2. Protects /dashboard/* and /onboarding — redirects to /login if not authenticated
 * 3. Redirects logged-in users away from /login
 *
 * Public routes: /, /login, /auth/callback, /card/[id], /api/*
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/dashboard") || pathname === "/onboarding";

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const redirectRes = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((c) =>
      redirectRes.cookies.set(c.name, c.value)
    );
    return redirectRes;
  }

  if (pathname === "/login" && user) {
    const redirectRes = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.getAll().forEach((c) =>
      redirectRes.cookies.set(c.name, c.value)
    );
    return redirectRes;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
