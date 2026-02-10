import { supabase } from "@/features/auth/lib/supabase-client";
import type {
  BalanceDirection,
  FriendActivityItem,
  FriendActivityRow,
  FriendBalance,
  FriendBalanceRow,
} from "@/features/friends/types/friend.types";

type FriendsResult<T> = { ok: true; data: T } | { ok: false; message: string };

export const FRIENDS_RPC_UNAVAILABLE_MESSAGE =
  "Friends data is temporarily unavailable due to a backend update. Please apply latest DB migrations and retry.";

function deriveDirection(netCents: number): BalanceDirection {
  if (netCents > 0) return "you_are_owed";
  if (netCents < 0) return "you_owe";
  return "settled";
}

function mapFriendBalanceRow(row: FriendBalanceRow): FriendBalance {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    email: row.email,
    netCents: row.net_cents,
    direction: deriveDirection(row.net_cents),
  };
}

function mapFriendActivityRow(row: FriendActivityRow): FriendActivityItem {
  return {
    expenseId: row.expense_id,
    description: row.description,
    amountCents: row.amount_cents,
    expenseDate: row.expense_date,
    groupId: row.group_id,
    groupName: row.group_name,
    groupEmoji: row.group_emoji,
    entryType: row.entry_type,
    paidByMe: row.paid_by_me,
    myShare: row.my_share,
    friendShare: row.friend_share,
    netCents: row.paid_by_me ? row.friend_share : -row.my_share,
    receiptAttached: Boolean(row.receipt_attached),
  };
}

function normalizeError(
  fallbackMessage: string,
  error: { message: string; code?: string | null } | null,
): string {
  if (!error) return fallbackMessage;

  const normalizedMessage = error.message.toLowerCase();
  const normalizedCode = (error.code ?? "").toUpperCase();

  const referencesFriendRpc =
    normalizedMessage.includes("get_cross_group_balances") ||
    normalizedMessage.includes("get_friend_activity");

  if (
    normalizedCode === "PGRST202" ||
    normalizedCode === "42883" ||
    (normalizedMessage.includes("schema cache") && referencesFriendRpc)
  ) {
    return FRIENDS_RPC_UNAVAILABLE_MESSAGE;
  }

  if (normalizedMessage.includes("network")) {
    return "Network issue while contacting Supabase. Try again.";
  }

  return error.message || fallbackMessage;
}

export async function listFriendBalances(): Promise<FriendsResult<FriendBalance[]>> {
  const { data, error } = await supabase.rpc("get_cross_group_balances");

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load friends.", error),
    };
  }

  const rows = (data ?? []) as FriendBalanceRow[];
  return { ok: true, data: rows.map(mapFriendBalanceRow) };
}

export async function getFriendActivity(
  friendId: string,
): Promise<FriendsResult<FriendActivityItem[]>> {
  const { data, error } = await supabase.rpc("get_friend_activity", {
    p_friend_id: friendId,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load activity.", error),
    };
  }

  const rows = (data ?? []) as FriendActivityRow[];
  return { ok: true, data: rows.map(mapFriendActivityRow) };
}
