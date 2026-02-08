create or replace function public.ensure_direct_friendship_group_for_pair(
  p_user_a uuid,
  p_user_b uuid,
  p_source text default 'request_accept'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_low uuid;
  v_high uuid;
  v_actor uuid;
  v_group_id uuid;
  v_source text;
begin
  if p_user_a is null or p_user_b is null then
    raise exception 'Both users are required.';
  end if;

  if p_user_a = p_user_b then
    raise exception 'Users must be different.';
  end if;

  v_low := least(p_user_a, p_user_b);
  v_high := greatest(p_user_a, p_user_b);
  v_actor := auth.uid();
  v_source := case
    when p_source in ('request_accept', 'shared_group') then p_source
    else 'request_accept'
  end;

  if v_actor is null then
    v_actor := p_user_a;
  end if;

  if v_actor <> v_low and v_actor <> v_high then
    raise exception 'Only friendship members can ensure direct groups.';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_low::text), hashtext(v_high::text));

  insert into public.friendships (user_low_id, user_high_id, source)
  values (v_low, v_high, v_source)
  on conflict (user_low_id, user_high_id) do nothing;

  select fs.direct_group_id
  into v_group_id
  from public.friendships fs
  where fs.user_low_id = v_low
    and fs.user_high_id = v_high
  for update;

  if v_group_id is null then
    insert into public.groups (name, emoji, group_type, group_kind, created_by)
    values ('Direct Split', '🤝', 'other', 'direct_friendship', v_actor)
    returning id into v_group_id;

    insert into public.group_members (group_id, user_id, role)
    values (v_group_id, v_low, 'member')
    on conflict (group_id, user_id) do nothing;

    insert into public.group_members (group_id, user_id, role)
    values (v_group_id, v_high, 'member')
    on conflict (group_id, user_id) do nothing;

    update public.friendships
    set direct_group_id = v_group_id,
        source = v_source,
        updated_at = timezone('utc', now())
    where user_low_id = v_low
      and user_high_id = v_high;
  end if;

  return v_group_id;
end;
$$;

revoke all on function public.ensure_direct_friendship_group_for_pair(uuid, uuid, text) from public;

create or replace function public.search_friend_candidates(
  p_query text,
  p_limit integer default 8
)
returns table(
  id uuid,
  display_name text,
  email text,
  relationship_status text
)
language sql
security definer
set search_path = public
as $$
  with me as (
    select auth.uid() as uid
  ),
  normalized as (
    select
      lower(trim(coalesce(p_query, ''))) as query,
      greatest(1, least(coalesce(p_limit, 8), 20)) as max_rows
  ),
  candidate_profiles as (
    select
      p.id,
      p.display_name,
      p.email,
      n.query,
      m.uid as me_id
    from normalized n
    cross join me m
    inner join public.profiles p on true
    where m.uid is not null
      and p.id <> m.uid
      and char_length(n.query) >= 2
      and (
        lower(p.display_name) like n.query || '%'
        or lower(coalesce(p.email, '')) like n.query || '%'
      )
  )
  select
    cp.id,
    cp.display_name,
    cp.email,
    case
      when exists (
        select 1
        from public.friendships fs
        where fs.user_low_id = least(cp.me_id, cp.id)
          and fs.user_high_id = greatest(cp.me_id, cp.id)
      )
      or exists (
        select 1
        from public.group_members gm1
        inner join public.group_members gm2 on gm2.group_id = gm1.group_id
        where gm1.user_id = cp.me_id
          and gm2.user_id = cp.id
      ) then 'already_friend'
      when exists (
        select 1
        from public.friend_requests fr
        where fr.requester_id = cp.me_id
          and fr.addressee_id = cp.id
          and fr.status = 'pending'
      ) then 'outgoing_pending'
      when exists (
        select 1
        from public.friend_requests fr
        where fr.requester_id = cp.id
          and fr.addressee_id = cp.me_id
          and fr.status = 'pending'
      ) then 'incoming_pending'
      else 'can_request'
    end as relationship_status
  from candidate_profiles cp
  order by
    case
      when lower(cp.display_name) = cp.query then 0
      when lower(coalesce(cp.email, '')) = cp.query then 1
      else 2
    end,
    cp.display_name asc,
    cp.email asc
  limit (select max_rows from normalized);
$$;

create or replace function public.send_friend_request(p_target_user_id uuid)
returns table(request_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid;
  v_low uuid;
  v_high uuid;
  v_existing_request public.friend_requests%rowtype;
begin
  v_me := auth.uid();

  if v_me is null then
    raise exception 'You must be authenticated to send friend requests.';
  end if;

  if p_target_user_id is null then
    raise exception 'Target user is required.';
  end if;

  if p_target_user_id = v_me then
    raise exception 'You cannot send a friend request to yourself.';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_target_user_id
  ) then
    raise exception 'User not found.';
  end if;

  if exists (
    select 1
    from public.friendships fs
    where fs.user_low_id = least(v_me, p_target_user_id)
      and fs.user_high_id = greatest(v_me, p_target_user_id)
  ) then
    raise exception 'You are already connected with this user.';
  end if;

  if exists (
    select 1
    from public.group_members gm1
    inner join public.group_members gm2 on gm2.group_id = gm1.group_id
    where gm1.user_id = v_me
      and gm2.user_id = p_target_user_id
  ) then
    raise exception 'You are already connected with this user.';
  end if;

  v_low := least(v_me, p_target_user_id);
  v_high := greatest(v_me, p_target_user_id);

  select fr.*
  into v_existing_request
  from public.friend_requests fr
  where fr.status = 'pending'
    and least(fr.requester_id, fr.addressee_id) = v_low
    and greatest(fr.requester_id, fr.addressee_id) = v_high
  order by fr.created_at desc
  limit 1;

  if found then
    if v_existing_request.requester_id = v_me then
      raise exception 'You already sent a friend request to this user.';
    else
      raise exception 'This user already sent you a friend request.';
    end if;
  end if;

  insert into public.friend_requests (requester_id, addressee_id, status)
  values (v_me, p_target_user_id, 'pending')
  returning id, status
  into request_id, status;

  return next;
end;
$$;

create or replace function public.list_incoming_friend_requests(
  p_status text default 'pending'
)
returns table(
  request_id uuid,
  requester_id uuid,
  display_name text,
  email text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    fr.id as request_id,
    fr.requester_id,
    p.display_name,
    p.email,
    fr.status,
    fr.created_at
  from public.friend_requests fr
  inner join public.profiles p on p.id = fr.requester_id
  where fr.addressee_id = auth.uid()
    and (p_status is null or fr.status = p_status)
  order by fr.created_at desc;
$$;

create or replace function public.list_outgoing_friend_requests(
  p_status text default 'pending'
)
returns table(
  request_id uuid,
  addressee_id uuid,
  display_name text,
  email text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    fr.id as request_id,
    fr.addressee_id,
    p.display_name,
    p.email,
    fr.status,
    fr.created_at
  from public.friend_requests fr
  inner join public.profiles p on p.id = fr.addressee_id
  where fr.requester_id = auth.uid()
    and (p_status is null or fr.status = p_status)
  order by fr.created_at desc;
$$;

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

  update public.friend_requests
  set status = 'declined',
      responded_at = timezone('utc', now())
  where id = v_request.id;

  return query
    select v_request.id, 'declined'::text, null::uuid;
end;
$$;

create or replace function public.cancel_friend_request(p_request_id uuid)
returns table(request_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
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

create or replace function public.get_direct_friend_group(p_friend_id uuid)
returns table(direct_group_id uuid)
language sql
security definer
set search_path = public
as $$
  select fs.direct_group_id
  from public.friendships fs
  where auth.uid() is not null
    and p_friend_id is not null
    and p_friend_id <> auth.uid()
    and fs.user_low_id = least(auth.uid(), p_friend_id)
    and fs.user_high_id = greatest(auth.uid(), p_friend_id)
  limit 1;
$$;

create or replace function public.ensure_direct_friend_group(p_friend_id uuid)
returns table(direct_group_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid;
  v_has_friendship boolean;
  v_has_shared_standard_group boolean;
  v_group_id uuid;
begin
  v_me := auth.uid();

  if v_me is null then
    raise exception 'You must be authenticated to ensure a direct friendship group.';
  end if;

  if p_friend_id is null then
    raise exception 'Friend user id is required.';
  end if;

  if p_friend_id = v_me then
    raise exception 'You cannot ensure a direct group with yourself.';
  end if;

  select exists (
    select 1
    from public.friendships fs
    where fs.user_low_id = least(v_me, p_friend_id)
      and fs.user_high_id = greatest(v_me, p_friend_id)
  ) into v_has_friendship;

  select exists (
    select 1
    from public.group_members gm1
    inner join public.group_members gm2 on gm2.group_id = gm1.group_id
    inner join public.groups g on g.id = gm1.group_id
    where gm1.user_id = v_me
      and gm2.user_id = p_friend_id
      and g.group_kind = 'standard'
  ) into v_has_shared_standard_group;

  if not v_has_friendship and not v_has_shared_standard_group then
    raise exception 'You can only create direct friendship groups for connected users.';
  end if;

  v_group_id := public.ensure_direct_friendship_group_for_pair(
    v_me,
    p_friend_id,
    case
      when v_has_friendship then 'request_accept'
      else 'shared_group'
    end
  );

  return query
    select v_group_id;
end;
$$;

grant execute on function public.search_friend_candidates(text, integer) to authenticated;
grant execute on function public.send_friend_request(uuid) to authenticated;
grant execute on function public.list_incoming_friend_requests(text) to authenticated;
grant execute on function public.list_outgoing_friend_requests(text) to authenticated;
grant execute on function public.respond_to_friend_request(uuid, text) to authenticated;
grant execute on function public.cancel_friend_request(uuid) to authenticated;
grant execute on function public.get_direct_friend_group(uuid) to authenticated;
grant execute on function public.ensure_direct_friend_group(uuid) to authenticated;

notify pgrst, 'reload schema';
