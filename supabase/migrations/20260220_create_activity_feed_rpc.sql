drop function if exists public.get_activity_feed(integer, integer);

create function public.get_activity_feed(
  p_limit integer default 25,
  p_offset integer default 0
)
returns table(
  event_id text,
  event_type text,
  occurred_at timestamptz,
  group_id uuid,
  group_name text,
  group_emoji text,
  group_kind text,
  actor_user_id uuid,
  actor_display_name text,
  expense_id uuid,
  description text,
  amount_cents integer,
  net_cents bigint,
  direction text,
  receipt_attached boolean
)
language sql
security definer
set search_path = public
as $$
  with auth_context as (
    select auth.uid() as user_id
  ),
  params as (
    select
      greatest(1, least(coalesce(p_limit, 25), 100))::integer as limit_rows,
      greatest(coalesce(p_offset, 0), 0)::integer as offset_rows
  ),
  my_groups as (
    select gm.group_id
    from public.group_members gm
    where gm.user_id = (select ac.user_id from auth_context ac)
  ),
  expense_events as (
    select
      'expense:' || e.id::text as event_id,
      case
        when e.entry_type = 'settlement' then 'settlement'
        else 'expense'
      end as event_type,
      e.created_at as occurred_at,
      e.group_id,
      case
        when g.group_kind = 'direct_friendship' then
          coalesce(
            'Direct with ' || nullif(trim(coalesce(counterparty.display_name, counterparty.email, '')), ''),
            g.name
          )
        else g.name
      end as group_name,
      g.emoji as group_emoji,
      g.group_kind,
      e.created_by as actor_user_id,
      coalesce(actor.display_name, actor.email, 'Someone') as actor_display_name,
      e.id as expense_id,
      e.description,
      e.amount_cents,
      case
        when e.paid_by = (select ac.user_id from auth_context ac) then
          coalesce(
            sum(
              case
                when es.user_id <> (select ac.user_id from auth_context ac) then es.share_cents
                else 0
              end
            ),
            0
          )::bigint
        when my_split.share_cents is not null then
          (-my_split.share_cents)::bigint
        else 0::bigint
      end as net_cents,
      case
        when (
          case
            when e.paid_by = (select ac.user_id from auth_context ac) then
              coalesce(
                sum(
                  case
                    when es.user_id <> (select ac.user_id from auth_context ac) then es.share_cents
                    else 0
                  end
                ),
                0
              )::bigint
            when my_split.share_cents is not null then
              (-my_split.share_cents)::bigint
            else 0::bigint
          end
        ) > 0 then 'you_are_owed'
        when (
          case
            when e.paid_by = (select ac.user_id from auth_context ac) then
              coalesce(
                sum(
                  case
                    when es.user_id <> (select ac.user_id from auth_context ac) then es.share_cents
                    else 0
                  end
                ),
                0
              )::bigint
            when my_split.share_cents is not null then
              (-my_split.share_cents)::bigint
            else 0::bigint
          end
        ) < 0 then 'you_owe'
        else 'settled'
      end as direction,
      (e.receipt_object_path is not null) as receipt_attached
    from public.expenses e
    inner join my_groups mg on mg.group_id = e.group_id
    inner join public.groups g on g.id = e.group_id
    left join public.expense_splits es on es.expense_id = e.id
    left join public.expense_splits my_split
      on my_split.expense_id = e.id
     and my_split.user_id = (select ac.user_id from auth_context ac)
    left join public.profiles actor on actor.id = e.created_by
    left join lateral (
      select
        p.display_name,
        p.email
      from public.group_members gm_other
      inner join public.profiles p on p.id = gm_other.user_id
      where gm_other.group_id = e.group_id
        and gm_other.user_id <> (select ac.user_id from auth_context ac)
      order by gm_other.joined_at asc, gm_other.id asc
      limit 1
    ) as counterparty on true
    group by
      e.id,
      e.entry_type,
      e.created_at,
      e.group_id,
      g.name,
      g.emoji,
      g.group_kind,
      e.created_by,
      actor.display_name,
      actor.email,
      e.description,
      e.amount_cents,
      e.paid_by,
      my_split.share_cents,
      e.receipt_object_path,
      counterparty.display_name,
      counterparty.email
  ),
  group_join_events as (
    select
      'group_join:' || gm.id::text as event_id,
      'group_joined' as event_type,
      gm.joined_at as occurred_at,
      gm.group_id,
      g.name as group_name,
      g.emoji as group_emoji,
      g.group_kind,
      gm.user_id as actor_user_id,
      coalesce(me.display_name, me.email, 'You') as actor_display_name,
      null::uuid as expense_id,
      'You were added to this group'::text as description,
      null::integer as amount_cents,
      0::bigint as net_cents,
      'settled'::text as direction,
      false as receipt_attached
    from public.group_members gm
    inner join public.groups g on g.id = gm.group_id
    left join public.profiles me on me.id = gm.user_id
    where gm.user_id = (select ac.user_id from auth_context ac)
      and g.group_kind = 'standard'
  ),
  combined as (
    select
      ee.event_id,
      ee.event_type,
      ee.occurred_at,
      ee.group_id,
      ee.group_name,
      ee.group_emoji,
      ee.group_kind,
      ee.actor_user_id,
      ee.actor_display_name,
      ee.expense_id,
      ee.description,
      ee.amount_cents,
      ee.net_cents,
      ee.direction,
      ee.receipt_attached
    from expense_events ee

    union all

    select
      ge.event_id,
      ge.event_type,
      ge.occurred_at,
      ge.group_id,
      ge.group_name,
      ge.group_emoji,
      ge.group_kind,
      ge.actor_user_id,
      ge.actor_display_name,
      ge.expense_id,
      ge.description,
      ge.amount_cents,
      ge.net_cents,
      ge.direction,
      ge.receipt_attached
    from group_join_events ge
  )
  select
    c.event_id,
    c.event_type,
    c.occurred_at,
    c.group_id,
    c.group_name,
    c.group_emoji,
    c.group_kind,
    c.actor_user_id,
    c.actor_display_name,
    c.expense_id,
    c.description,
    c.amount_cents,
    c.net_cents,
    c.direction,
    c.receipt_attached
  from combined c
  order by c.occurred_at desc, c.event_id desc
  limit (select p.limit_rows from params p)
  offset (select p.offset_rows from params p);
$$;

revoke all on function public.get_activity_feed(integer, integer) from public, anon;
grant execute on function public.get_activity_feed(integer, integer) to authenticated;

notify pgrst, 'reload schema';
