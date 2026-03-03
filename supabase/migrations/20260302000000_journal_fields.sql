-- Journal pivot: add execution_tag, mood_tag to trades and increase note limit
-- Run this in Supabase SQL Editor: Project → SQL Editor → New query → paste → Run

-- execution_tag: single-tap reflection on how the trader executed that day
-- Allowed values: followed_plan, overtraded, revenge_traded, fomo_entry, cut_early
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS execution_tag text
  CHECK (execution_tag IS NULL OR execution_tag IN (
    'followed_plan', 'overtraded', 'revenge_traded', 'fomo_entry', 'cut_early'
  ));

-- mood_tag: single-tap emotional state after the trading day
-- Allowed values: calm, confident, anxious, frustrated, tired
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS mood_tag text
  CHECK (mood_tag IS NULL OR mood_tag IN (
    'calm', 'confident', 'anxious', 'frustrated', 'tired'
  ));

-- Increase note limit from 280 chars to 2000 for proper journaling
ALTER TABLE public.trades
  DROP CONSTRAINT IF EXISTS trades_note_check;

ALTER TABLE public.trades
  ADD CONSTRAINT trades_note_check
  CHECK (note IS NULL OR char_length(note) <= 2000);
