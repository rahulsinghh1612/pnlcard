alter table public.profiles
add column if not exists yearly_trial_used_at timestamptz;
