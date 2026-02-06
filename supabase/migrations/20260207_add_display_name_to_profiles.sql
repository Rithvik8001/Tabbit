-- Add display_name column to profiles
alter table public.profiles
  add column if not exists display_name text;

alter table public.profiles
  add constraint profiles_display_name_check
    check (display_name is null or char_length(trim(display_name)) between 1 and 50);

-- Update handle_new_user to capture name from OAuth metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      null
    )
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(profiles.display_name, excluded.display_name),
        updated_at = timezone('utc', now());
  return new;
end;
$$;
