drop function if exists public.get_friend_activity(uuid);

create or replace function public.get_friend_activity(p_friend_id uuid)
returns table(
  expense_id uuid,
  description text,
  amount_cents integer,
  expense_date date,
  group_id uuid,
  group_name text,
  group_emoji text,
  entry_type text,
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
    e.group_id,
    g.name as group_name,
    g.emoji as group_emoji,
    e.entry_type,
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
    (e.paid_by = auth.uid() and friend_split.id is not null)
    or
    (e.paid_by = p_friend_id and my_split.id is not null)
  )
  order by e.expense_date desc
  limit 50;
$$;
