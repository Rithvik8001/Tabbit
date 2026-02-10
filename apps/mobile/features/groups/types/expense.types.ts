import type { ExpenseReceiptMetadata } from "@/features/groups/types/expense-receipt.types";

export type SplitType = "equal" | "exact" | "percent";
export type ExpenseEntryType = "expense" | "settlement";

export type Expense = ExpenseReceiptMetadata & {
  id: string;
  groupId: string;
  description: string;
  amountCents: number;
  currency: string;
  expenseDate: string;
  splitType: SplitType;
  entryType: ExpenseEntryType;
  paidBy: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseRow = {
  id: string;
  group_id: string;
  description: string;
  amount_cents: number;
  currency: string;
  expense_date: string;
  split_type: SplitType;
  entry_type: ExpenseEntryType;
  paid_by: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  receipt_bucket?: string | null;
  receipt_object_path?: string | null;
  receipt_mime_type?: string | null;
  receipt_size_bytes?: number | null;
  receipt_uploaded_by?: string | null;
  receipt_uploaded_at?: string | null;
};

export type ExpenseSplit = {
  id: string;
  expenseId: string;
  userId: string;
  shareCents: number;
  percentShare: number | null;
};

export type ExpenseSplitRow = {
  id: string;
  expense_id: string;
  user_id: string;
  share_cents: number;
  percent_share: number | null;
};

export type ExpenseWithSplits = Expense & {
  splits: ExpenseSplit[];
  paidByName: string | null;
};

export type ExpenseWithSplitsRow = ExpenseRow & {
  expense_splits: ExpenseSplitRow[];
  paid_by_profile:
    | { display_name: string | null; email: string | null }[]
    | null;
};

export type CreateExpenseInput = {
  description: string;
  amountCents: number;
  currency?: string;
  expenseDate: string;
  splitType: SplitType;
  entryType?: ExpenseEntryType;
  paidBy: string;
  participants: ExpenseSplitInput[];
};

export type ExpenseSplitInput = {
  userId: string;
  shareCents: number;
  percentShare?: number | null;
};

export type MemberBalance = {
  userId: string;
  displayName: string | null;
  email: string | null;
  netCents: number;
};

export type BalanceEdge = {
  fromUserId: string;
  fromName: string | null;
  toUserId: string;
  toName: string | null;
  amountCents: number;
};
