create or replace function public.remove_group_member_if_settled(
  p_group_member_id uuid
)
returns table(
  id uuid,
  group_id uuid,
  user_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_group_member public.group_members%rowtype;
  v_group_kind text;
  v_net_cents bigint;
begin
  v_actor := auth.uid();

  if v_actor is null then
    raise exception 'You must be authenticated to remove a group member.';
  end if;

  if p_group_member_id is null then
    raise exception 'Group member id is required.';
  end if;

  select gm.*
  into v_group_member
  from public.group_members gm
  where gm.id = p_group_member_id
  for update;

  if not found then
    raise exception 'Group member not found.';
  end if;

  select g.group_kind
  into v_group_kind
  from public.groups g
  where g.id = v_group_member.group_id;

  if v_group_kind <> 'standard' then
    raise exception 'Members can only be removed from standard groups.';
  end if;

  if v_group_member.user_id <> v_actor
     and not public.is_group_admin(v_group_member.group_id) then
    raise exception 'Only admins can remove other members from this group.';
  end if;

  with expense_contributions as (
    select
      e.id as expense_id,
      case
        when e.paid_by = v_group_member.user_id then
          coalesce(
            sum(
              case
                when es.user_id <> v_group_member.user_id then es.share_cents
                else 0
              end
            ),
            0
          )::bigint
        else
          -coalesce(
            max(
              case
                when es.user_id = v_group_member.user_id then es.share_cents
                else null
              end
            ),
            0
          )::bigint
      end as net_cents
    from public.expenses e
    inner join public.expense_splits es on es.expense_id = e.id
    where e.group_id = v_group_member.group_id
      and (
        e.paid_by = v_group_member.user_id
        or exists (
          select 1
          from public.expense_splits ms
          where ms.expense_id = e.id
            and ms.user_id = v_group_member.user_id
        )
      )
    group by e.id, e.paid_by
  )
  select coalesce(sum(ec.net_cents), 0)::bigint
  into v_net_cents
  from expense_contributions ec;

  if v_net_cents <> 0 then
    raise exception 'This member must be settled up before they can be removed.';
  end if;

  return query
    delete from public.group_members gm
    where gm.id = p_group_member_id
    returning gm.id, gm.group_id, gm.user_id;
end;
$$;

revoke all on function public.remove_group_member_if_settled(uuid) from public, anon;
grant execute on function public.remove_group_member_if_settled(uuid) to authenticated;

create or replace function public.get_group_balance_summaries()
returns table(
  group_id uuid,
  net_cents bigint,
  direction text
)
language sql
security definer
set search_path = public
as $$
  with standard_my_groups as (
    select distinct gm.group_id
    from public.group_members gm
    inner join public.groups g on g.id = gm.group_id
    where gm.user_id = auth.uid()
      and g.group_kind = 'standard'
  ),
  expense_contributions as (
    select
      e.group_id,
      case
        when e.paid_by = auth.uid() then
          coalesce(
            sum(
              case
                when es.user_id <> auth.uid() then es.share_cents
                else 0
              end
            ),
            0
          )::bigint
        else
          -coalesce(
            max(
              case
                when es.user_id = auth.uid() then es.share_cents
                else null
              end
            ),
            0
          )::bigint
      end as my_net_cents
    from public.expenses e
    inner join standard_my_groups smg on smg.group_id = e.group_id
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
      smg.group_id,
      coalesce(sum(ec.my_net_cents), 0)::bigint as net_cents
    from standard_my_groups smg
    left join expense_contributions ec on ec.group_id = smg.group_id
    group by smg.group_id
  )
  select
    gn.group_id,
    gn.net_cents,
    case
      when gn.net_cents > 0 then 'you_are_owed'
      when gn.net_cents < 0 then 'you_owe'
      else 'settled'
    end as direction
  from group_net gn;
$$;

revoke all on function public.get_group_balance_summaries() from public, anon;
grant execute on function public.get_group_balance_summaries() to authenticated;

notify pgrst, 'reload schema';
