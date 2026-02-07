create or replace function public.get_home_snapshot()
returns table(
  net_balance_cents bigint,
  you_owe_cents bigint,
  you_are_owed_cents bigint,
  unsettled_groups_count integer,
  active_groups_count integer
)
language sql security definer set search_path = public
as $$
  with my_groups as (
    select distinct gm.group_id
    from public.group_members gm
    where gm.user_id = auth.uid()
  ),
  expense_contributions as (
    select
      e.id as expense_id,
      e.group_id,
      case
        when e.paid_by = auth.uid() then
          coalesce(sum(case when es.user_id <> auth.uid() then es.share_cents else 0 end), 0)::bigint
        else
          -coalesce(max(case when es.user_id = auth.uid() then es.share_cents else null end), 0)::bigint
      end as my_net_cents
    from public.expenses e
    inner join my_groups mg on mg.group_id = e.group_id
    inner join public.expense_splits es on es.expense_id = e.id
    where e.paid_by = auth.uid()
      or exists (
        select 1
        from public.expense_splits me
        where me.expense_id = e.id
          and me.user_id = auth.uid()
      )
    group by e.id, e.group_id, e.paid_by
  ),
  group_net as (
    select
      ec.group_id,
      sum(ec.my_net_cents)::bigint as net_cents
    from expense_contributions ec
    group by ec.group_id
  )
  select
    coalesce(sum(ec.my_net_cents), 0)::bigint as net_balance_cents,
    coalesce(sum(case when ec.my_net_cents < 0 then -ec.my_net_cents else 0 end), 0)::bigint as you_owe_cents,
    coalesce(sum(case when ec.my_net_cents > 0 then ec.my_net_cents else 0 end), 0)::bigint as you_are_owed_cents,
    coalesce((select count(*) from group_net gn where gn.net_cents <> 0), 0)::integer as unsettled_groups_count,
    coalesce((select count(*) from my_groups), 0)::integer as active_groups_count
  from expense_contributions ec;
$$;

create or replace function public.get_home_recent_activity(p_limit integer default 10)
returns table(
  expense_id uuid,
  group_id uuid,
  group_name text,
  group_emoji text,
  description text,
  entry_type text,
  expense_date date,
  created_at timestamptz,
  net_cents bigint,
  direction text
)
language sql security definer set search_path = public
as $$
  with my_groups as (
    select distinct gm.group_id
    from public.group_members gm
    where gm.user_id = auth.uid()
  ),
  expense_contributions as (
    select
      e.id as expense_id,
      e.group_id,
      e.description,
      e.entry_type,
      e.expense_date,
      e.created_at,
      case
        when e.paid_by = auth.uid() then
          coalesce(sum(case when es.user_id <> auth.uid() then es.share_cents else 0 end), 0)::bigint
        else
          -coalesce(max(case when es.user_id = auth.uid() then es.share_cents else null end), 0)::bigint
      end as my_net_cents
    from public.expenses e
    inner join my_groups mg on mg.group_id = e.group_id
    inner join public.expense_splits es on es.expense_id = e.id
    where e.paid_by = auth.uid()
      or exists (
        select 1
        from public.expense_splits me
        where me.expense_id = e.id
          and me.user_id = auth.uid()
      )
    group by e.id, e.group_id, e.description, e.entry_type, e.expense_date, e.created_at, e.paid_by
  )
  select
    ec.expense_id,
    ec.group_id,
    g.name as group_name,
    g.emoji as group_emoji,
    ec.description,
    ec.entry_type,
    ec.expense_date,
    ec.created_at,
    ec.my_net_cents as net_cents,
    case
      when ec.my_net_cents > 0 then 'you_are_owed'
      else 'you_owe'
    end as direction
  from expense_contributions ec
  inner join public.groups g on g.id = ec.group_id
  where ec.my_net_cents <> 0
  order by ec.expense_date desc, ec.created_at desc, ec.expense_id desc
  limit greatest(1, least(coalesce(p_limit, 10), 50));
$$;
