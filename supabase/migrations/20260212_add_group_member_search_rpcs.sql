create index if not exists profiles_display_name_lower_idx
  on public.profiles ((lower(display_name)));

create index if not exists profiles_email_lower_idx
  on public.profiles ((lower(email)));

create or replace function public.search_group_member_candidates(
  p_group_id uuid,
  p_query text,
  p_limit integer default 8
)
returns table(id uuid, display_name text, email text)
language sql
security definer
set search_path = public
as $$
  with normalized as (
    select
      lower(trim(coalesce(p_query, ''))) as query,
      greatest(1, least(coalesce(p_limit, 8), 20)) as max_rows
  )
  select
    p.id,
    p.display_name,
    p.email
  from normalized n
  inner join public.profiles p on true
  where public.is_group_admin(p_group_id)
    and char_length(n.query) >= 2
    and (
      lower(p.display_name) like n.query || '%'
      or lower(coalesce(p.email, '')) like n.query || '%'
    )
    and not exists (
      select 1
      from public.group_members gm
      where gm.group_id = p_group_id
        and gm.user_id = p.id
    )
  order by
    case
      when lower(p.display_name) = n.query then 0
      when lower(coalesce(p.email, '')) = n.query then 1
      else 2
    end,
    p.display_name asc,
    p.email asc
  limit (select max_rows from normalized);
$$;

create or replace function public.find_group_member_candidate_by_email(
  p_group_id uuid,
  p_email text
)
returns table(id uuid, display_name text, email text)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.display_name,
    p.email
  from public.profiles p
  where public.is_group_admin(p_group_id)
    and lower(coalesce(p.email, '')) = lower(trim(coalesce(p_email, '')))
    and not exists (
      select 1
      from public.group_members gm
      where gm.group_id = p_group_id
        and gm.user_id = p.id
    )
  limit 1;
$$;
