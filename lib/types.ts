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

/** Subscription row from Supabase subscriptions table */
export interface Subscription {
  id: string;
  user_id: string;
  provider: string;
  provider_subscription_id: string | null;
  plan_type: "monthly" | "yearly";
  status: "active" | "cancelled" | "expired";
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}
