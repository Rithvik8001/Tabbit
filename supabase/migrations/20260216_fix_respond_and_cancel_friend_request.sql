-- Fix: "column reference status is ambiguous" in respond_to_friend_request
-- and cancel_friend_request.
--
-- The RETURNS TABLE output parameter `status` clashes with the
-- friend_requests.status column inside UPDATE SET / WHERE clauses.
-- PostgreSQL does NOT allow table-qualified names in SET, so we use
-- `#variable_conflict use_column` to tell PL/pgSQL that bare `status`
-- inside SQL statements refers to the TABLE COLUMN, not the output param.
-- (The output param is only populated via RETURN QUERY with explicit casts.)

-- ─── respond_to_friend_request ───────────────────────────────────────────────
create or replace function public.respond_to_friend_request(
  p_request_id uuid,
  p_action text
)
returns table(
  request_id uuid,
  status text,
  direct_group_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_me uuid;
  v_action text;
  v_request public.friend_requests%rowtype;
  v_group_id uuid;
begin
  v_me := auth.uid();

  if v_me is null then
    raise exception 'You must be authenticated to respond to friend requests.';
  end if;

  v_action := lower(trim(coalesce(p_action, '')));

  if v_action not in ('accept', 'decline') then
    raise exception 'Action must be accept or decline.';
  end if;

  select fr.*
  into v_request
  from public.friend_requests fr
  where fr.id = p_request_id
  for update;

  if not found then
    raise exception 'Friend request not found.';
  end if;

  if v_request.addressee_id <> v_me then
    raise exception 'Only the request recipient can respond.';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Friend request is no longer pending.';
  end if;

  if v_action = 'accept' then
    update public.friend_requests
    set status = 'accepted',
        responded_at = timezone('utc', now())
    where id = v_request.id;

    v_group_id := public.ensure_direct_friendship_group_for_pair(
      v_request.requester_id,
      v_request.addressee_id,
      'request_accept'
    );

    -- Cancel any reciprocal pending request the acceptor sent to the requester
    update public.friend_requests
    set status = 'canceled',
        responded_at = timezone('utc', now())
    where status = 'pending'
      and requester_id = v_me
      and addressee_id = v_request.requester_id;

    return query
      select v_request.id, 'accepted'::text, v_group_id;

    return;
  end if;

  -- Decline path
  update public.friend_requests
  set status = 'declined',
      responded_at = timezone('utc', now())
  where id = v_request.id;

  return query
    select v_request.id, 'declined'::text, null::uuid;
end;
$$;

-- ─── cancel_friend_request ───────────────────────────────────────────────────
create or replace function public.cancel_friend_request(p_request_id uuid)
returns table(request_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_request public.friend_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'You must be authenticated to cancel friend requests.';
  end if;

  select fr.*
  into v_request
  from public.friend_requests fr
  where fr.id = p_request_id
  for update;

  if not found then
    raise exception 'Friend request not found.';
  end if;

  if v_request.requester_id <> auth.uid() then
    raise exception 'Only the request sender can cancel this request.';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'Only pending requests can be canceled.';
  end if;

  update public.friend_requests
  set status = 'canceled',
      responded_at = timezone('utc', now())
  where id = v_request.id;

  return query
    select v_request.id, 'canceled'::text;
end;
$$;

-- Reload PostgREST schema cache
notify pgrst, 'reload schema';
