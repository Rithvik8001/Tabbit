-- Fix: "column reference status is ambiguous" in send_friend_request
--
-- The RETURNING clause used bare `status`, which PostgreSQL could not
-- disambiguate between the friend_requests.status column and the
-- output parameter `status` from RETURNS TABLE. Table-qualifying the
-- column resolves the ambiguity.

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
  returning id, friend_requests.status
  into request_id, status;

  return next;
end;
$$;

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
