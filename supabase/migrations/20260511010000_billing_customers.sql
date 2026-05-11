create table if not exists public.billing_customers (
  id uuid primary key default gen_random_uuid(),
  normalized_email text not null unique,
  latest_auth_user_id uuid,
  latest_profile_id uuid,
  yearly_trial_used_at timestamptz,
  first_paid_at timestamptz,
  latest_provider text,
  latest_provider_subscription_id text,
  last_known_status text,
  deleted_account_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger billing_customers_updated_at
  before update on public.billing_customers
  for each row execute function public.set_updated_at();

alter table public.billing_customers enable row level security;

insert into public.billing_customers (
  normalized_email,
  latest_auth_user_id,
  latest_profile_id,
  yearly_trial_used_at
)
select
  lower(trim(u.email)),
  p.id,
  p.id,
  p.yearly_trial_used_at
from public.profiles p
join auth.users u on u.id = p.id
where p.yearly_trial_used_at is not null
  and u.email is not null
on conflict (normalized_email) do update
set
  latest_auth_user_id = excluded.latest_auth_user_id,
  latest_profile_id = excluded.latest_profile_id,
  yearly_trial_used_at = coalesce(public.billing_customers.yearly_trial_used_at, excluded.yearly_trial_used_at);
