-- expenses table
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  description text not null,
  amount_cents integer not null,
  currency text not null default 'USD',
  expense_date date not null default current_date,
  split_type text not null default 'equal',
  paid_by uuid not null
    references auth.users(id) on delete cascade
    references public.profiles(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint expenses_description_length check (char_length(trim(description)) between 1 and 100),
  constraint expenses_amount_positive check (amount_cents > 0),
  constraint expenses_currency_check check (char_length(currency) = 3),
  constraint expenses_split_type_check check (split_type in ('equal', 'exact', 'percent'))
);

create index if not exists expenses_group_date_idx
  on public.expenses (group_id, expense_date desc);

create index if not exists expenses_paid_by_idx
  on public.expenses (paid_by);

alter table public.expenses enable row level security;

-- RLS policies for expenses
drop policy if exists "Members can view group expenses" on public.expenses;
create policy "Members can view group expenses"
  on public.expenses for select
  using (public.is_group_member(group_id));

drop policy if exists "Members can create expenses" on public.expenses;
create policy "Members can create expenses"
  on public.expenses for insert
  with check (public.is_group_member(group_id) and created_by = auth.uid());

drop policy if exists "Creators can update expenses" on public.expenses;
create policy "Creators can update expenses"
  on public.expenses for update
  using (created_by = auth.uid());

drop policy if exists "Creators or admins can delete expenses" on public.expenses;
create policy "Creators or admins can delete expenses"
  on public.expenses for delete
  using (created_by = auth.uid() or public.is_group_admin(group_id));

-- updated_at trigger
create or replace function public.set_expenses_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_expenses_updated_at on public.expenses;
create trigger set_expenses_updated_at
  before update on public.expenses
  for each row execute function public.set_expenses_updated_at();

-- expense_splits table
create table if not exists public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  user_id uuid not null
    references auth.users(id) on delete cascade
    references public.profiles(id) on delete cascade,
  share_cents integer not null,
  percent_share numeric(5,2),
  created_at timestamptz not null default timezone('utc', now()),
  constraint expense_splits_share_non_negative check (share_cents >= 0),
  constraint expense_splits_percent_range check (percent_share is null or (percent_share >= 0 and percent_share <= 100)),
  constraint expense_splits_expense_user_unique unique (expense_id, user_id)
);

create index if not exists expense_splits_expense_id_idx
  on public.expense_splits (expense_id);

create index if not exists expense_splits_user_id_idx
  on public.expense_splits (user_id);

alter table public.expense_splits enable row level security;

-- RLS policies for expense_splits
drop policy if exists "Members can view expense splits" on public.expense_splits;
create policy "Members can view expense splits"
  on public.expense_splits for select
  using (exists (
    select 1 from public.expenses e
    where e.id = expense_id and public.is_group_member(e.group_id)
  ));

drop policy if exists "Members can create expense splits" on public.expense_splits;
create policy "Members can create expense splits"
  on public.expense_splits for insert
  with check (exists (
    select 1 from public.expenses e
    where e.id = expense_id and public.is_group_member(e.group_id)
  ));

drop policy if exists "Creators can update expense splits" on public.expense_splits;
create policy "Creators can update expense splits"
  on public.expense_splits for update
  using (exists (
    select 1 from public.expenses e
    where e.id = expense_id and e.created_by = auth.uid()
  ));

drop policy if exists "Creators can delete expense splits" on public.expense_splits;
create policy "Creators can delete expense splits"
  on public.expense_splits for delete
  using (exists (
    select 1 from public.expenses e
    where e.id = expense_id and e.created_by = auth.uid()
  ));
