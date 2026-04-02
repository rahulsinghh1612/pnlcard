/**
 * Validates a redirect path to prevent open redirect attacks.
 * Only allows relative paths starting with "/" that don't redirect externally.
 */
export function safeRedirect(redirect: string | null, fallback = "/dashboard"): string {
  if (
    !redirect ||
    !redirect.startsWith("/") ||
    redirect.startsWith("//") ||
    redirect.includes("://")
  ) {
    return fallback;
  }
  return redirect;
}
