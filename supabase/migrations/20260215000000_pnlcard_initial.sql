-- PNLCard initial schema: profiles, trades, subscriptions + RLS
-- Run this in Supabase SQL Editor: Project → SQL Editor → New query → paste → Run

-- ============================================================
-- 1. PROFILES
-- Stores user settings. id = auth.users.id (one profile per user)
-- ============================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  x_handle text,
  currency text NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  trading_capital numeric(14, 2),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  plan_expires_at timestamptz,
  card_theme text NOT NULL DEFAULT 'light' CHECK (card_theme IN ('light', 'dark')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. TRADES
-- One entry per user per day. UNIQUE(user_id, trade_date)
-- ============================================================
CREATE TABLE public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trade_date date NOT NULL,
  num_trades integer NOT NULL CHECK (num_trades >= 1),
  net_pnl numeric(12, 2) NOT NULL,
  charges numeric(12, 2),
  capital_deployed numeric(14, 2),
  note text CHECK (note IS NULL OR char_length(note) <= 280),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, trade_date)
);

-- Index for fast lookups by user + date range
CREATE INDEX idx_trades_user_date ON public.trades(user_id, trade_date DESC);

-- ============================================================
-- 3. SUBSCRIPTIONS
-- Payment provider records (Razorpay, etc.)
-- ============================================================
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_subscription_id text,
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);

-- ============================================================
-- 4. UPDATED_AT TRIGGERS
-- Keep updated_at in sync on profile and trades
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can SELECT, INSERT, UPDATE, DELETE only their own row
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Trades: users can CRUD only their own trades
CREATE POLICY "trades_select_own" ON public.trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "trades_insert_own" ON public.trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trades_update_own" ON public.trades
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "trades_delete_own" ON public.trades
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: users can read/manage only their own
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_delete_own" ON public.subscriptions
  FOR DELETE USING (auth.uid() = user_id);
