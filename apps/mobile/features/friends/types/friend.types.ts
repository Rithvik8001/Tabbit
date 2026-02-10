import type { ExpenseEntryType } from "@/features/groups/types/expense.types";

export type BalanceDirection = "you_are_owed" | "you_owe" | "settled";

/** Raw row from get_cross_group_balances() RPC */
export type FriendBalanceRow = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  net_cents: number;
};

/** Domain model for friend balance */
export type FriendBalance = {
  userId: string;
  displayName: string | null;
  email: string | null;
  netCents: number;
  direction: BalanceDirection;
};

export type FriendListRowVM = {
  id: string;
  title: string;
  subtitle: string | null;
  statusLabel: string;
  statusAmount: string | null;
  tone: "positive" | "negative" | "neutral";
};

/** Raw row from get_friend_activity() RPC */
export type FriendActivityRow = {
  expense_id: string;
  description: string;
  amount_cents: number;
  expense_date: string;
  group_id: string;
  group_name: string;
  group_emoji: string | null;
  entry_type: ExpenseEntryType;
  paid_by_me: boolean;
  my_share: number;
  friend_share: number;
  receipt_attached: boolean | null;
};

/** Domain model for a shared expense with a friend */
export type FriendActivityItem = {
  expenseId: string;
  description: string;
  amountCents: number;
  expenseDate: string;
  groupId: string;
  groupName: string;
  groupEmoji: string | null;
  entryType: ExpenseEntryType;
  paidByMe: boolean;
  myShare: number;
  friendShare: number;
  /** Positive = friend owes me, negative = I owe friend */
  netCents: number;
  receiptAttached: boolean;
};
