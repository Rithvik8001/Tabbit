import { supabase } from "@/features/auth/lib/supabase-client";
import type {
  AttachExpenseReceiptInput,
  ExpenseReceiptMetadata,
} from "@/features/groups/types/expense-receipt.types";
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

type ExpenseReceiptRpcRow = {
  expense_id: string;
  receipt_bucket: string | null;
  receipt_object_path: string | null;
  receipt_mime_type: string | null;
  receipt_size_bytes: number | null;
  receipt_uploaded_by: string | null;
  receipt_uploaded_at: string | null;
};

const expenseWithSplitsColumns =
  "id, group_id, description, amount_cents, currency, expense_date, split_type, entry_type, paid_by, created_by, created_at, updated_at, receipt_bucket, receipt_object_path, receipt_mime_type, receipt_size_bytes, receipt_uploaded_by, receipt_uploaded_at, expense_splits(id, expense_id, user_id, share_cents, percent_share), paid_by_profile:profiles!paid_by(display_name, email)";

type PaidByProfileRow = {
  display_name: string | null;
  email: string | null;
};

export type CreateSettlementInput = {
  groupId: string;
  amountCents: number;
  expenseDate: string;
  paidBy: string;
  paidTo: string;
};

function mapExpenseReceiptMetadata(row: {
  receipt_bucket?: string | null;
  receipt_object_path?: string | null;
  receipt_mime_type?: string | null;
  receipt_size_bytes?: number | null;
  receipt_uploaded_by?: string | null;
  receipt_uploaded_at?: string | null;
}): ExpenseReceiptMetadata {
  return {
    receiptBucket: row.receipt_bucket ?? null,
    receiptObjectPath: row.receipt_object_path ?? null,
    receiptMimeType: row.receipt_mime_type ?? null,
    receiptSizeBytes: row.receipt_size_bytes ?? null,
    receiptUploadedBy: row.receipt_uploaded_by ?? null,
    receiptUploadedAt: row.receipt_uploaded_at ?? null,
  };
}

function mapExpenseRow(row: ExpenseRow): Expense {
  return {
    ...mapExpenseReceiptMetadata(row),
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

function toNonEmptyLabel(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapPaidByProfileRow(
  profile: ExpenseWithSplitsRow["paid_by_profile"],
): PaidByProfileRow | null {
  if (Array.isArray(profile)) {
    return profile[0] ?? null;
  }

  return profile ?? null;
}

function mapExpenseWithSplitsRow(row: ExpenseWithSplitsRow): ExpenseWithSplits {
  const profile = mapPaidByProfileRow(row.paid_by_profile);
  return {
    ...mapExpenseRow(row),
    splits: (row.expense_splits ?? []).map(mapSplitRow),
    paidByName:
      toNonEmptyLabel(profile?.display_name) ??
      toNonEmptyLabel(profile?.email) ??
      null,
  };
}

function mapExpenseReceiptRpcRow(row: ExpenseReceiptRpcRow): ExpenseReceiptMetadata {
  return {
    receiptBucket: row.receipt_bucket,
    receiptObjectPath: row.receipt_object_path,
    receiptMimeType: row.receipt_mime_type,
    receiptSizeBytes: row.receipt_size_bytes,
    receiptUploadedBy: row.receipt_uploaded_by,
    receiptUploadedAt: row.receipt_uploaded_at,
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
    return "Expense details are invalid. Check the description, amount, split, and receipt metadata.";
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
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

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
): Promise<ExpensesResult<Expense>> {
  const participants = input.participants.map((participant) => ({
    user_id: participant.userId,
    share_cents: participant.shareCents,
    percent_share: participant.percentShare ?? null,
  }));

  const { data, error } = await supabase.rpc("create_expense_with_splits", {
    p_group_id: groupId,
    p_description: input.description.trim(),
    p_amount_cents: input.amountCents,
    p_currency: input.currency ?? "USD",
    p_expense_date: input.expenseDate,
    p_split_type: input.splitType,
    p_entry_type: input.entryType ?? "expense",
    p_paid_by: input.paidBy,
    p_participants: participants,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to create expense.", error),
    };
  }

  const rows = (data ?? []) as ExpenseRow[];
  const row = rows[0];

  if (!row) {
    return {
      ok: false,
      message: "Expense did not return a result.",
    };
  }

  return { ok: true, data: mapExpenseRow(row) };
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

  return createExpense(input.groupId, {
    description: "Record payment",
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
  });
}

export async function getExpenseById(
  expenseId: string,
): Promise<ExpensesResult<ExpenseWithSplits>> {
  const { data, error } = await supabase
    .from("expenses")
    .select(expenseWithSplitsColumns)
    .eq("id", expenseId)
    .single();

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load expense.", error),
    };
  }

  return {
    ok: true,
    data: mapExpenseWithSplitsRow(data as ExpenseWithSplitsRow),
  };
}

export async function updateExpense(
  expenseId: string,
  input: CreateExpenseInput,
): Promise<ExpensesResult<Expense>> {
  const participants = input.participants.map((participant) => ({
    user_id: participant.userId,
    share_cents: participant.shareCents,
    percent_share: participant.percentShare ?? null,
  }));

  const { data, error } = await supabase.rpc("update_expense_with_splits", {
    p_expense_id: expenseId,
    p_description: input.description.trim(),
    p_amount_cents: input.amountCents,
    p_currency: input.currency ?? "USD",
    p_expense_date: input.expenseDate,
    p_split_type: input.splitType,
    p_paid_by: input.paidBy,
    p_participants: participants,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to update expense.", error),
    };
  }

  const rows = (data ?? []) as ExpenseRow[];
  const row = rows[0];

  if (!row) {
    return {
      ok: false,
      message: "Expense update did not return a result.",
    };
  }

  return {
    ok: true,
    data: mapExpenseRow(row),
  };
}

export async function attachExpenseReceipt(
  expenseId: string,
  input: AttachExpenseReceiptInput,
): Promise<ExpensesResult<ExpenseReceiptMetadata>> {
  const { data, error } = await supabase.rpc("attach_expense_receipt", {
    p_expense_id: expenseId,
    p_bucket: input.bucket,
    p_object_path: input.objectPath,
    p_mime_type: input.mimeType,
    p_size_bytes: input.sizeBytes,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to attach receipt.", error),
    };
  }

  const rows = (data ?? []) as ExpenseReceiptRpcRow[];
  const row = rows[0];

  if (!row) {
    return {
      ok: false,
      message: "Receipt attachment did not return a result.",
    };
  }

  return {
    ok: true,
    data: mapExpenseReceiptRpcRow(row),
  };
}

export async function clearExpenseReceipt(
  expenseId: string,
): Promise<ExpensesResult<ExpenseReceiptMetadata>> {
  const { data, error } = await supabase.rpc("clear_expense_receipt", {
    p_expense_id: expenseId,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to clear receipt.", error),
    };
  }

  const rows = (data ?? []) as ExpenseReceiptRpcRow[];
  const row = rows[0];

  if (!row) {
    return {
      ok: false,
      message: "Receipt clear did not return a result.",
    };
  }

  return {
    ok: true,
    data: mapExpenseReceiptRpcRow(row),
  };
}

export async function createExpenseReceiptSignedUrl(
  bucket: string,
  objectPath: string,
  expiresInSeconds = 120,
): Promise<ExpensesResult<string>> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(objectPath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return {
      ok: false,
      message: normalizeError("Unable to open receipt preview.", error),
    };
  }

  return { ok: true, data: data.signedUrl };
}

export async function deleteExpense(
  expenseId: string,
): Promise<ExpensesResult<void>> {
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to delete expense.", error),
    };
  }

  return { ok: true, data: undefined };
}
