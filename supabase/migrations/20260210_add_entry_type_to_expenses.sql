alter table public.expenses
  add column if not exists entry_type text not null default 'expense';

alter table public.expenses
  drop constraint if exists expenses_entry_type_check;

alter table public.expenses
  add constraint expenses_entry_type_check
    check (entry_type in ('expense', 'settlement'));
