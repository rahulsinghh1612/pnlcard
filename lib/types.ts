/** Profile row from Supabase profiles table */
export interface Profile {
  id: string;
  display_name: string;
  x_handle: string | null;
  currency: "INR" | "USD";
  timezone: string;
  trading_capital: number | null;
  plan: "free" | "premium";
  plan_expires_at: string | null;
  card_theme: "light" | "dark";
  created_at: string;
  updated_at: string;
}
