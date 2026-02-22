-- Add UNIQUE constraint on user_id in subscriptions table.
-- This allows the webhook to upsert (insert or update) a subscription
-- for a user, ensuring only one subscription record per user at a time.
-- Run this in Supabase SQL Editor after the initial migration.

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
