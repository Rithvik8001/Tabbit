import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import {
  type BalanceDirection,
  computeMemberBalances,
  getUserBalance,
  simplifyDebts,
} from "@/features/groups/lib/balance-calculator";
import {
  createExpense as createExpenseRecord,
  deleteExpense as deleteExpenseRecord,
  listExpensesForGroup,
} from "@/features/groups/lib/expenses-repository";
import type { GroupMember } from "@/features/groups/types/group-member.types";
import type {
  BalanceEdge,
  CreateExpenseInput,
  ExpenseWithSplits,
  MemberBalance,
} from "@/features/groups/types/expense.types";

type ActionResult = { ok: true } | { ok: false; message: string };

type UseGroupExpensesValue = {
  expenses: ExpenseWithSplits[];
  balances: MemberBalance[];
  userBalance: { netCents: number; direction: BalanceDirection };
  simplifiedDebts: BalanceEdge[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createExpense: (input: CreateExpenseInput) => Promise<ActionResult>;
  deleteExpense: (expenseId: string) => Promise<ActionResult>;
  isCreating: boolean;
};

export function useGroupExpenses(
  groupId: string | undefined,
  members: GroupMember[],
): UseGroupExpensesValue {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const refresh = useCallback(async () => {
    if (!groupId) {
      setExpenses([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const result = await listExpensesForGroup(groupId);

    if (!result.ok) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    setExpenses(result.data);
    setError(null);
    setIsLoading(false);
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const balances = useMemo(
    () => computeMemberBalances(expenses, members),
    [expenses, members],
  );

  const userBalanceResult = useMemo(
    () => getUserBalance(expenses, members, user?.id ?? ""),
    [expenses, members, user?.id],
  );

  const simplifiedDebtsResult = useMemo(
    () => simplifyDebts(expenses, members),
    [expenses, members],
  );

  const createExpense = useCallback(
    async (input: CreateExpenseInput): Promise<ActionResult> => {
      if (!groupId || !user?.id) {
        return { ok: false, message: "No group selected." };
      }

      setIsCreating(true);

      const result = await createExpenseRecord(groupId, input, user.id);

      setIsCreating(false);

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      await refresh();

      return { ok: true };
    },
    [groupId, user?.id, refresh],
  );

  const deleteExpense = useCallback(
    async (expenseId: string): Promise<ActionResult> => {
      const result = await deleteExpenseRecord(expenseId);

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));

      return { ok: true };
    },
    [],
  );

  return {
    expenses,
    balances,
    userBalance: userBalanceResult,
    simplifiedDebts: simplifiedDebtsResult,
    isLoading,
    error,
    refresh,
    createExpense,
    deleteExpense,
    isCreating,
  };
}
