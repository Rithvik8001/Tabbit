import type { ExpenseEntryType } from "@/features/groups/types/expense.types";

export type HomeActivityDirection = "you_owe" | "you_are_owed";

export type HomeSnapshotRow = {
  net_balance_cents: number | string;
  you_owe_cents: number | string;
  you_are_owed_cents: number | string;
  unsettled_groups_count: number | string;
  active_groups_count: number | string;
};

export type HomeSnapshot = {
  netBalanceCents: number;
  youOweCents: number;
  youAreOwedCents: number;
  unsettledGroupsCount: number;
  activeGroupsCount: number;
};

export type HomeActivityRow = {
  expense_id: string;
  group_id: string;
  group_name: string;
  group_emoji: string | null;
  description: string;
  entry_type: ExpenseEntryType;
  expense_date: string;
  created_at: string;
  net_cents: number | string;
  direction: HomeActivityDirection;
  receipt_attached: boolean | null;
};

export type HomeActivityItem = {
  expenseId: string;
  groupId: string;
  groupName: string;
  groupEmoji: string | null;
  description: string;
  entryType: ExpenseEntryType;
  expenseDate: string;
  createdAt: string;
  netCents: number;
  direction: HomeActivityDirection;
  receiptAttached: boolean;
};
