alter table public.groups
  add column if not exists group_kind text not null default 'standard';

alter table public.groups
  drop constraint if exists groups_group_kind_check;

alter table public.groups
  add constraint groups_group_kind_check
    check (group_kind in ('standard', 'direct_friendship'));

create index if not exists groups_group_kind_idx
  on public.groups (group_kind);

create or replace function public.is_standard_group(p_group_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.groups g
    where g.id = p_group_id
      and g.group_kind = 'standard'
  );
$$;

drop policy if exists "Users can insert own groups" on public.groups;
drop policy if exists "Users can insert own standard groups" on public.groups;
create policy "Users can insert own standard groups"
  on public.groups
  for insert
  with check (auth.uid() = created_by and group_kind = 'standard');

drop policy if exists "Users can update own groups" on public.groups;
drop policy if exists "Users can update own standard groups" on public.groups;
create policy "Users can update own standard groups"
  on public.groups
  for update
  using (auth.uid() = created_by and group_kind = 'standard')
  with check (auth.uid() = created_by and group_kind = 'standard');

drop policy if exists "Users can delete own groups" on public.groups;
drop policy if exists "Users can delete own standard groups" on public.groups;
create policy "Users can delete own standard groups"
  on public.groups
  for delete
  using (auth.uid() = created_by and group_kind = 'standard');

drop policy if exists "Admins can add group members" on public.group_members;
create policy "Admins can add group members"
  on public.group_members
  for insert
  with check (public.is_standard_group(group_id) and public.is_group_admin(group_id));

drop policy if exists "Admins or self can remove members" on public.group_members;
create policy "Admins or self can remove members"
  on public.group_members
  for delete
  using (
    public.is_standard_group(group_id)
    and (
      user_id = auth.uid()
      or public.is_group_admin(group_id)
    )
  );

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null
    references auth.users(id) on delete cascade
    references public.profiles(id) on delete cascade,
  addressee_id uuid not null
    references auth.users(id) on delete cascade
    references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz,
  constraint friend_requests_user_pair_check check (requester_id <> addressee_id),
  constraint friend_requests_status_check check (status in ('pending', 'accepted', 'declined', 'canceled')),
  constraint friend_requests_response_state_check check (
    (status = 'pending' and responded_at is null)
    or (status <> 'pending' and responded_at is not null)
  )
);

create index if not exists friend_requests_requester_id_idx
  on public.friend_requests (requester_id, created_at desc);

create index if not exists friend_requests_addressee_id_idx
  on public.friend_requests (addressee_id, created_at desc);

create unique index if not exists friend_requests_pending_pair_unique_idx
  on public.friend_requests (
    (least(requester_id, addressee_id)),
    (greatest(requester_id, addressee_id))
  )
  where status = 'pending';

alter table public.friend_requests enable row level security;

drop policy if exists "Users can view own friend requests" on public.friend_requests;
create policy "Users can view own friend requests"
  on public.friend_requests
  for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "Users can create outgoing friend requests" on public.friend_requests;
create policy "Users can create outgoing friend requests"
  on public.friend_requests
  for insert
  with check (
    auth.uid() = requester_id
    and requester_id <> addressee_id
    and status = 'pending'
    and responded_at is null
  );

drop policy if exists "Users can update own friend requests" on public.friend_requests;
create policy "Users can update own friend requests"
  on public.friend_requests
  for update
  using (auth.uid() = requester_id or auth.uid() = addressee_id)
  with check (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_low_id uuid not null
    references auth.users(id) on delete cascade
    references public.profiles(id) on delete cascade,
  user_high_id uuid not null
    references auth.users(id) on delete cascade
    references public.profiles(id) on delete cascade,
  direct_group_id uuid references public.groups(id) on delete set null,
  source text not null default 'request_accept',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint friendships_user_order_check check (user_low_id < user_high_id),
  constraint friendships_source_check check (source in ('request_accept', 'shared_group')),
  constraint friendships_pair_unique unique (user_low_id, user_high_id)
);

create index if not exists friendships_user_low_idx
  on public.friendships (user_low_id);

create index if not exists friendships_user_high_idx
  on public.friendships (user_high_id);

create unique index if not exists friendships_direct_group_unique_idx
  on public.friendships (direct_group_id)
  where direct_group_id is not null;

alter table public.friendships enable row level security;

drop policy if exists "Users can view own friendships" on public.friendships;
create policy "Users can view own friendships"
  on public.friendships
  for select
  using (auth.uid() = user_low_id or auth.uid() = user_high_id);

create or replace function public.set_friendships_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_friendships_updated_at on public.friendships;
create trigger set_friendships_updated_at
  before update on public.friendships
  for each row execute function public.set_friendships_updated_at();
