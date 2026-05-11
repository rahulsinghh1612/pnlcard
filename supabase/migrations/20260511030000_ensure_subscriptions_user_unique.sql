do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_user_id_unique'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions
      add constraint subscriptions_user_id_unique unique (user_id);
  end if;
end $$;
