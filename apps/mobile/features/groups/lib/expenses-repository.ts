import { supabase } from "@/features/auth/lib/supabase-client";
import type {
  CreateExpenseInput,
  Expense,
  ExpenseRow,
  ExpenseSplit,
  ExpenseSplitRow,
  ExpenseWithSplits,
  ExpenseWithSplitsRow,
} from "@/features/groups/types/expense.types";

type ExpensesResult<T> = { ok: true; data: T } | { ok: false; message: string };

const expenseWithSplitsColumns =
  "id, group_id, description, amount_cents, currency, expense_date, split_type, entry_type, paid_by, created_by, created_at, updated_at, expense_splits(id, expense_id, user_id, share_cents, percent_share), paid_by_profile:profiles!paid_by(display_name, email)";

export type CreateSettlementInput = {
  groupId: string;
  amountCents: number;
  expenseDate: string;
  paidBy: string;
  paidTo: string;
  createdBy: string;
};

function mapExpenseRow(row: ExpenseRow): Expense {
  return {
    id: row.id,
    groupId: row.group_id,
    description: row.description,
    amountCents: row.amount_cents,
    currency: row.currency,
    expenseDate: row.expense_date,
    splitType: row.split_type,
    entryType: row.entry_type,
    paidBy: row.paid_by,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSplitRow(row: ExpenseSplitRow): ExpenseSplit {
  return {
    id: row.id,
    expenseId: row.expense_id,
    userId: row.user_id,
    shareCents: row.share_cents,
    percentShare: row.percent_share,
  };
}

function mapExpenseWithSplitsRow(row: ExpenseWithSplitsRow): ExpenseWithSplits {
  const profile = row.paid_by_profile?.[0] ?? null;
  return {
    ...mapExpenseRow(row),
    splits: (row.expense_splits ?? []).map(mapSplitRow),
    paidByName: profile?.display_name ?? profile?.email ?? null,
  };
}

function normalizeError(
  fallbackMessage: string,
  error: { message: string; code?: string | null } | null,
): string {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === "42501") {
    return "You don't have permission for this expense action.";
  }

  if (error.code === "23514") {
    return "Expense details are invalid. Check the description, amount, and split.";
  }

  if (error.code === "23502") {
    return "Required expense fields are missing.";
  }

  if (error.message.toLowerCase().includes("network")) {
    return "Network issue while contacting Supabase. Try again.";
  }

  return error.message || fallbackMessage;
}

export async function listExpensesForGroup(
  groupId: string,
): Promise<ExpensesResult<ExpenseWithSplits[]>> {
  const { data, error } = await supabase
    .from("expenses")
    .select(expenseWithSplitsColumns)
    .eq("group_id", groupId)
    .order("expense_date", { ascending: false });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load expenses.", error),
    };
  }

  const rows = (data ?? []) as ExpenseWithSplitsRow[];

  return {
    ok: true,
    data: rows.map(mapExpenseWithSplitsRow),
  };
}

export async function createExpense(
  groupId: string,
  input: CreateExpenseInput,
  userId: string,
): Promise<ExpensesResult<Expense>> {
  // Step 1: Insert the expense
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      group_id: groupId,
      description: input.description.trim(),
      amount_cents: input.amountCents,
      currency: input.currency ?? "USD",
      expense_date: input.expenseDate,
      split_type: input.splitType,
      entry_type: input.entryType ?? "expense",
      paid_by: input.paidBy,
      created_by: userId,
    })
    .select(
      "id, group_id, description, amount_cents, currency, expense_date, split_type, entry_type, paid_by, created_by, created_at, updated_at",
    )
    .single();

  if (expenseError) {
    return {
      ok: false,
      message: normalizeError("Unable to create expense.", expenseError),
    };
  }

  const expense = mapExpenseRow(expenseData as ExpenseRow);

  // Step 2: Insert splits
  const splitRows = input.participants.map((p) => ({
    expense_id: expense.id,
    user_id: p.userId,
    share_cents: p.shareCents,
    percent_share: p.percentShare ?? null,
  }));

  const { error: splitsError } = await supabase
    .from("expense_splits")
    .insert(splitRows);

  if (splitsError) {
    // Roll back: delete the expense (cascade will clean up any partial splits)
    await supabase.from("expenses").delete().eq("id", expense.id);

    return {
      ok: false,
      message: normalizeError("Unable to save expense splits.", splitsError),
    };
  }

  return {
    ok: true,
    data: expense,
  };
}

export async function createSettlement(
  input: CreateSettlementInput,
): Promise<ExpensesResult<Expense>> {
  if (input.paidBy === input.paidTo) {
    return {
      ok: false,
      message: "Payer and payee must be different users.",
    };
  }

  if (input.amountCents <= 0) {
    return {
      ok: false,
      message: "Settlement amount must be greater than $0.00.",
    };
  }

  return createExpense(
    input.groupId,
    {
      description: "Settle Up",
      amountCents: input.amountCents,
      expenseDate: input.expenseDate,
      splitType: "exact",
      entryType: "settlement",
      paidBy: input.paidBy,
      participants: [
        {
          userId: input.paidTo,
          shareCents: input.amountCents,
        },
      ],
    },
    input.createdBy,
  );
}

export async function deleteExpense(
  expenseId: string,
): Promise<ExpensesResult<void>> {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to delete expense.", error),
    };
  }

  return { ok: true, data: undefined };
}
