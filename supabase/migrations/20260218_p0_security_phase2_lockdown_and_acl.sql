drop policy if exists "Members can create expenses" on public.expenses;
drop policy if exists "No direct expense inserts" on public.expenses;
create policy "No direct expense inserts"
  on public.expenses
  for insert
  with check (false);

drop policy if exists "Creators can update expenses" on public.expenses;
drop policy if exists "No direct expense updates" on public.expenses;
create policy "No direct expense updates"
  on public.expenses
  for update
  using (false)
  with check (false);

drop policy if exists "Members can create expense splits" on public.expense_splits;
drop policy if exists "Creators can update expense splits" on public.expense_splits;
drop policy if exists "Creators can delete expense splits" on public.expense_splits;
drop policy if exists "No direct expense split inserts" on public.expense_splits;
drop policy if exists "No direct expense split updates" on public.expense_splits;
drop policy if exists "No direct expense split deletes" on public.expense_splits;

create policy "No direct expense split inserts"
  on public.expense_splits
  for insert
  with check (false);

create policy "No direct expense split updates"
  on public.expense_splits
  for update
  using (false)
  with check (false);

create policy "No direct expense split deletes"
  on public.expense_splits
  for delete
  using (false);

drop function if exists public.find_user_id_by_email(text);

revoke all on function public.get_cross_group_balances() from public, anon;
grant execute on function public.get_cross_group_balances() to authenticated;

revoke all on function public.get_friend_activity(uuid) from public, anon;
grant execute on function public.get_friend_activity(uuid) to authenticated;

revoke all on function public.search_friend_candidates(text, integer) from public, anon;
grant execute on function public.search_friend_candidates(text, integer) to authenticated;

revoke all on function public.send_friend_request(uuid) from public, anon;
grant execute on function public.send_friend_request(uuid) to authenticated;

revoke all on function public.list_incoming_friend_requests(text) from public, anon;
grant execute on function public.list_incoming_friend_requests(text) to authenticated;

revoke all on function public.list_outgoing_friend_requests(text) from public, anon;
grant execute on function public.list_outgoing_friend_requests(text) to authenticated;

revoke all on function public.respond_to_friend_request(uuid, text) from public, anon;
grant execute on function public.respond_to_friend_request(uuid, text) to authenticated;

revoke all on function public.cancel_friend_request(uuid) from public, anon;
grant execute on function public.cancel_friend_request(uuid) to authenticated;

revoke all on function public.get_direct_friend_group(uuid) from public, anon;
grant execute on function public.get_direct_friend_group(uuid) to authenticated;

revoke all on function public.ensure_direct_friend_group(uuid) from public, anon;
grant execute on function public.ensure_direct_friend_group(uuid) to authenticated;

revoke all on function public.get_home_snapshot() from public, anon;
grant execute on function public.get_home_snapshot() to authenticated;

revoke all on function public.get_home_recent_activity(integer) from public, anon;
grant execute on function public.get_home_recent_activity(integer) to authenticated;

revoke all on function public.search_group_member_candidates(uuid, text, integer) from public, anon;
grant execute on function public.search_group_member_candidates(uuid, text, integer) to authenticated;

revoke all on function public.find_group_member_candidate_by_email(uuid, text) from public, anon;
grant execute on function public.find_group_member_candidate_by_email(uuid, text) to authenticated;

revoke all on function public.create_expense_with_splits(
  uuid,
  text,
  integer,
  text,
  date,
  text,
  text,
  uuid,
  jsonb
) from public, anon;
grant execute on function public.create_expense_with_splits(
  uuid,
  text,
  integer,
  text,
  date,
  text,
  text,
  uuid,
  jsonb
) to authenticated;

revoke all on function public.update_expense_with_splits(
  uuid,
  text,
  integer,
  text,
  date,
  text,
  uuid,
  jsonb
) from public, anon;
grant execute on function public.update_expense_with_splits(
  uuid,
  text,
  integer,
  text,
  date,
  text,
  uuid,
  jsonb
) to authenticated;

notify pgrst, 'reload schema';
