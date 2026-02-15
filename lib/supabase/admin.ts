import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase admin client — uses service role key, bypasses RLS.
 * ONLY use in server-side code (API routes, Server Components).
 * NEVER expose this client or the service role key to the browser.
 *
 * Use case: Fetching trade data for public card pages (/card/[id])
 * where the visitor is not authenticated.
 *
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not set (e.g. local dev).
 * Add it from Supabase Dashboard → Project Settings → API → service_role.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}
