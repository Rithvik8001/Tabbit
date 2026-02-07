-- group_members table
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade
    references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default timezone('utc', now()),
  constraint group_members_group_user_unique unique (group_id, user_id),
  constraint group_members_role_check check (role in ('admin', 'member'))
);

create index if not exists group_members_user_id_idx
  on public.group_members (user_id);

create index if not exists group_members_group_id_idx
  on public.group_members (group_id);

alter table public.group_members enable row level security;

-- Security definer helpers to avoid infinite recursion in RLS policies.
-- These bypass RLS so the policy subqueries don't re-trigger themselves.

create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_group_admin(p_group_id uuid)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = auth.uid() and role = 'admin'
  );
$$;

-- SELECT: user can see members of groups they belong to
drop policy if exists "Members can view group members" on public.group_members;
create policy "Members can view group members"
  on public.group_members
  for select
  using (public.is_group_member(group_id));

-- INSERT: only group admin can add members
drop policy if exists "Admins can add group members" on public.group_members;
create policy "Admins can add group members"
  on public.group_members
  for insert
  with check (public.is_group_admin(group_id));

-- DELETE: admin can remove anyone; members can remove themselves
drop policy if exists "Admins or self can remove members" on public.group_members;
create policy "Admins or self can remove members"
  on public.group_members
  for delete
  using (
    user_id = auth.uid()
    or public.is_group_admin(group_id)
  );

-- Update groups SELECT policy to membership-based (creator fallback covers INSERT...RETURNING timing)
drop policy if exists "Users can read own groups" on public.groups;
create policy "Members can read their groups"
  on public.groups for select
  using (created_by = auth.uid() or public.is_group_member(id));

-- Auto-add creator as admin member (security definer to bypass RLS on first insert)
create or replace function public.add_creator_as_group_member()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end; $$;

drop trigger if exists add_creator_as_group_member on public.groups;
create trigger add_creator_as_group_member
  after insert on public.groups
  for each row execute function public.add_creator_as_group_member();

-- Seed existing groups with creator as admin member
insert into public.group_members (group_id, user_id, role)
select id, created_by, 'admin' from public.groups
on conflict (group_id, user_id) do nothing;

-- RPC for email lookup (profiles RLS blocks cross-user reads)
create or replace function public.find_user_id_by_email(p_email text)
returns table(id uuid, display_name text, email text)
language plpgsql security definer set search_path = public
as $$ begin
  return query select p.id, p.display_name, p.email
    from profiles p where lower(p.email) = lower(p_email);
end; $$;
