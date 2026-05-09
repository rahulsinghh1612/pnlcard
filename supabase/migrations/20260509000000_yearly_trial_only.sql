-- Stop granting automatic onboarding trials to all new profiles.
alter table profiles
  alter column trial_ends_at drop default;

-- Allow billing-backed subscription states such as authenticated yearly trials.
alter table subscriptions
  drop constraint if exists subscriptions_status_check;

alter table subscriptions
  add constraint subscriptions_status_check
  check (
    status in (
      'created',
      'authenticated',
      'active',
      'pending',
      'halted',
      'cancelled',
      'expired',
      'completed'
    )
  );
