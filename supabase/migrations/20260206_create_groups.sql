create extension if not exists pgcrypto;

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null,
  group_type text not null default 'other',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint groups_name_check check (char_length(trim(name)) between 1 and 40),
  constraint groups_emoji_check check (char_length(trim(emoji)) between 1 and 8),
  constraint groups_group_type_check
    check (group_type in ('trip', 'home', 'couple', 'other'))
);

create index if not exists groups_created_by_created_at_idx
  on public.groups (created_by, created_at desc);

alter table public.groups enable row level security;

drop policy if exists "Users can read own groups" on public.groups;
create policy "Users can read own groups"
  on public.groups
  for select
  using (auth.uid() = created_by);

drop policy if exists "Users can insert own groups" on public.groups;
create policy "Users can insert own groups"
  on public.groups
  for insert
  with check (auth.uid() = created_by);

drop policy if exists "Users can update own groups" on public.groups;
create policy "Users can update own groups"
  on public.groups
  for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Users can delete own groups" on public.groups;
create policy "Users can delete own groups"
  on public.groups
  for delete
  using (auth.uid() = created_by);

create or replace function public.set_groups_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_groups_updated_at on public.groups;
create trigger set_groups_updated_at
  before update on public.groups
  for each row execute function public.set_groups_updated_at();
