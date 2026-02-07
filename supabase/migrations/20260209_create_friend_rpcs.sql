-- get_cross_group_balances: returns one row per co-group-member with aggregated net balance
create or replace function public.get_cross_group_balances()
returns table(user_id uuid, display_name text, email text, net_cents bigint)
language sql security definer set search_path = public
as $$
  with my_groups as (
    select group_id from public.group_members where group_members.user_id = auth.uid()
  ),
  shared_users as (
    select distinct gm.user_id
    from public.group_members gm
    inner join my_groups mg on mg.group_id = gm.group_id
    where gm.user_id <> auth.uid()
  ),
  owed_to_me as (
    -- expenses I paid, sum of each friend's split share
    select es.user_id, sum(es.share_cents)::bigint as total
    from public.expenses e
    inner join public.expense_splits es on es.expense_id = e.id
    inner join my_groups mg on mg.group_id = e.group_id
    where e.paid_by = auth.uid()
      and es.user_id <> auth.uid()
    group by es.user_id
  ),
  i_owe as (
    -- expenses a friend paid, sum of my split share
    select e.paid_by as user_id, sum(es.share_cents)::bigint as total
    from public.expenses e
    inner join public.expense_splits es on es.expense_id = e.id
    inner join my_groups mg on mg.group_id = e.group_id
    where e.paid_by <> auth.uid()
      and es.user_id = auth.uid()
    group by e.paid_by
  )
  select
    su.user_id,
    p.display_name,
    p.email,
    coalesce(otm.total, 0) - coalesce(io.total, 0) as net_cents
  from shared_users su
  inner join public.profiles p on p.id = su.user_id
  left join owed_to_me otm on otm.user_id = su.user_id
  left join i_owe io on io.user_id = su.user_id
  order by abs(coalesce(otm.total, 0) - coalesce(io.total, 0)) desc;
$$;

-- get_friend_activity: returns recent shared expenses between current user and a friend
create or replace function public.get_friend_activity(p_friend_id uuid)
returns table(
  expense_id uuid,
  description text,
  amount_cents integer,
  expense_date date,
  group_name text,
  group_emoji text,
  paid_by_me boolean,
  my_share integer,
  friend_share integer
)
language sql security definer set search_path = public
as $$
  with shared_groups as (
    select gm1.group_id
    from public.group_members gm1
    inner join public.group_members gm2 on gm2.group_id = gm1.group_id
    where gm1.user_id = auth.uid()
      and gm2.user_id = p_friend_id
  )
  select
    e.id as expense_id,
    e.description,
    e.amount_cents,
    e.expense_date,
    g.name as group_name,
    g.emoji as group_emoji,
    (e.paid_by = auth.uid()) as paid_by_me,
    coalesce(my_split.share_cents, 0) as my_share,
    coalesce(friend_split.share_cents, 0) as friend_share
  from public.expenses e
  inner join shared_groups sg on sg.group_id = e.group_id
  inner join public.groups g on g.id = e.group_id
  left join public.expense_splits my_split
    on my_split.expense_id = e.id and my_split.user_id = auth.uid()
  left join public.expense_splits friend_split
    on friend_split.expense_id = e.id and friend_split.user_id = p_friend_id
  where (
    -- I paid and friend has a split
    (e.paid_by = auth.uid() and friend_split.id is not null)
    or
    -- Friend paid and I have a split
    (e.paid_by = p_friend_id and my_split.id is not null)
  )
  order by e.expense_date desc
  limit 50;
$$;
