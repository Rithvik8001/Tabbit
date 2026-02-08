alter table public.profiles
  add column if not exists display_name text;

update public.profiles p
set display_name = coalesce(
  nullif(left(trim(p.display_name), 50), ''),
  nullif(left(trim(au.raw_user_meta_data ->> 'display_name'), 50), ''),
  nullif(left(trim(au.raw_user_meta_data ->> 'full_name'), 50), ''),
  nullif(left(trim(au.raw_user_meta_data ->> 'name'), 50), ''),
  nullif(left(trim(split_part(coalesce(p.email, au.email, ''), '@', 1)), 50), ''),
  'Tabbit User'
)
from auth.users au
where au.id = p.id
  and (p.display_name is null or char_length(trim(p.display_name)) = 0);

update public.profiles
set display_name = coalesce(
  nullif(left(trim(display_name), 50), ''),
  nullif(left(trim(split_part(coalesce(email, ''), '@', 1)), 50), ''),
  'Tabbit User'
)
where display_name is null or char_length(trim(display_name)) = 0;

alter table public.profiles
  drop constraint if exists profiles_split_style_check;

alter table public.profiles
  drop constraint if exists profiles_use_context_check;

alter table public.profiles
  drop column if exists split_style,
  drop column if exists use_context;

alter table public.profiles
  drop constraint if exists profiles_display_name_check;

alter table public.profiles
  alter column display_name set not null;

alter table public.profiles
  add constraint profiles_display_name_check
    check (char_length(trim(display_name)) between 1 and 50);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fallback_display_name text;
begin
  fallback_display_name := coalesce(
    nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 50), ''),
    nullif(left(trim(new.raw_user_meta_data ->> 'full_name'), 50), ''),
    nullif(left(trim(new.raw_user_meta_data ->> 'name'), 50), ''),
    nullif(left(trim(split_part(coalesce(new.email, ''), '@', 1)), 50), ''),
    'Tabbit User'
  );

  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, fallback_display_name)
  on conflict (id) do update
    set email = excluded.email,
        display_name = case
          when profiles.display_name is null or char_length(trim(profiles.display_name)) = 0
            then excluded.display_name
          else profiles.display_name
        end,
        updated_at = timezone('utc', now());

  return new;
end;
$$;
