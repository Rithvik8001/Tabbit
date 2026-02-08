-- Notification preferences: per-user opt-in/opt-out for email notifications
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  friend_request_received boolean not null default true,
  friend_request_accepted boolean not null default true,
  added_to_group boolean not null default true,
  new_expense boolean not null default true,
  settlement_recorded boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_notification_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_notification_preferences_updated_at();

-- RLS: users can read/update their own row only
alter table public.notification_preferences enable row level security;

create policy "Users can read own notification preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create preferences row for new users (security definer to bypass RLS)
create or replace function public.handle_new_user_notifications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger trg_create_notification_preferences
  after insert on auth.users
  for each row execute function public.handle_new_user_notifications();

-- Backfill existing users
insert into public.notification_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;
