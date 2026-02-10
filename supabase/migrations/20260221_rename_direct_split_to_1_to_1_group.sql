update public.groups
set name = '1:1 Group'
where group_kind = 'direct_friendship'
  and name = 'Direct Split';

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
    values ('1:1 Group', '🤝', 'other', 'direct_friendship', v_actor)
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

notify pgrst, 'reload schema';
