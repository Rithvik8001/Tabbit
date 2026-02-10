import type { GroupMember } from "@/features/groups/types/group-member.types";
import type {
  BalanceEdge,
  ExpenseWithSplits,
  MemberBalance,
} from "@/features/groups/types/expense.types";

export function computeMemberBalances(
  expenses: ExpenseWithSplits[],
  members: GroupMember[],
): MemberBalance[] {
  const memberLookup = new Map(members.map((member) => [member.userId, member]));
  const netMap = new Map<string, number>();

  for (const member of members) {
    netMap.set(member.userId, 0);
  }

  for (const expense of expenses) {
    const payerId = expense.paidBy;
    if (!netMap.has(payerId)) {
      netMap.set(payerId, 0);
    }

    for (const split of expense.splits) {
      if (!netMap.has(split.userId)) {
        netMap.set(split.userId, 0);
      }

      if (split.userId === payerId) continue;

      // Payer is owed this amount
      netMap.set(payerId, (netMap.get(payerId) ?? 0) + split.shareCents);
      // Participant owes this amount
      netMap.set(
        split.userId,
        (netMap.get(split.userId) ?? 0) - split.shareCents,
      );
    }
  }

  return Array.from(netMap.entries()).map(([userId, netCents]) => {
    const member = memberLookup.get(userId);
    return {
      userId,
      displayName: member?.displayName ?? null,
      email: member?.email ?? null,
      netCents,
      isCurrentMember: Boolean(member),
    };
  });
}

export function simplifyDebts(
  expenses: ExpenseWithSplits[],
  members: GroupMember[],
): BalanceEdge[] {
  const balances = computeMemberBalances(expenses, members);
  const balanceLookup = new Map(balances.map((balance) => [balance.userId, balance]));

  const creditors: { userId: string; amount: number }[] = [];
  const debtors: { userId: string; amount: number }[] = [];

  for (const balance of balances) {
    if (balance.netCents > 0) {
      creditors.push({ userId: balance.userId, amount: balance.netCents });
    } else if (balance.netCents < 0) {
      debtors.push({ userId: balance.userId, amount: -balance.netCents });
    }
  }

  // Sort descending by amount for greedy matching
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const edges: BalanceEdge[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const settle = Math.min(creditors[ci].amount, debtors[di].amount);

    if (settle > 0) {
      const debtor = balanceLookup.get(debtors[di].userId);
      const creditor = balanceLookup.get(creditors[ci].userId);

      edges.push({
        fromUserId: debtors[di].userId,
        fromName: debtor?.displayName ?? null,
        fromEmail: debtor?.email ?? null,
        fromIsCurrentMember: debtor?.isCurrentMember ?? false,
        toUserId: creditors[ci].userId,
        toName: creditor?.displayName ?? null,
        toEmail: creditor?.email ?? null,
        toIsCurrentMember: creditor?.isCurrentMember ?? false,
        amountCents: settle,
      });
    }

    creditors[ci].amount -= settle;
    debtors[di].amount -= settle;

    if (creditors[ci].amount === 0) ci++;
    if (debtors[di].amount === 0) di++;
  }

  return edges;
}

export type BalanceDirection = "you_are_owed" | "you_owe" | "settled";

export function getUserBalance(
  expenses: ExpenseWithSplits[],
  members: GroupMember[],
  currentUserId: string,
): { netCents: number; direction: BalanceDirection } {
  const balances = computeMemberBalances(expenses, members);
  const userBalance = balances.find((b) => b.userId === currentUserId);
  const netCents = userBalance?.netCents ?? 0;

  let direction: BalanceDirection;
  if (netCents > 0) {
    direction = "you_are_owed";
  } else if (netCents < 0) {
    direction = "you_owe";
  } else {
    direction = "settled";
  }

  return { netCents, direction };
}
