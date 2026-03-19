-- Add trial_ends_at column to profiles
alter table profiles
  add column if not exists trial_ends_at timestamptz;

-- Default for new rows: 14 days from now
alter table profiles
  alter column trial_ends_at set default now() + interval '14 days';

-- Existing free users: give them a fresh 14-day trial
update profiles
  set trial_ends_at = now() + interval '14 days'
  where plan = 'free' or plan is null;

-- Existing premium users: backfill with created_at + 14 days (moot — subscription takes priority)
update profiles
  set trial_ends_at = created_at + interval '14 days'
  where plan = 'premium';
