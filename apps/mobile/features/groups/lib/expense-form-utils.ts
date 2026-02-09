import type { SplitType, ExpenseSplitInput } from "@/features/groups/types/expense.types";
import { formatCents } from "@/features/groups/lib/format-currency";

export const MAX_DESCRIPTION_LENGTH = 100;

export const SPLIT_TYPE_OPTIONS: { type: SplitType; label: string; subtitle: string }[] = [
  { type: "equal", label: "Equal", subtitle: "Split evenly among participants" },
  { type: "exact", label: "Exact", subtitle: "Specify each person's share" },
  { type: "percent", label: "Percent", subtitle: "Split by percentage" },
];

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function computeEqualSplits(
  participantIds: string[],
  amountCents: number,
): ExpenseSplitInput[] {
  if (participantIds.length === 0) return [];
  const perPerson = Math.floor(amountCents / participantIds.length);
  const remainder = amountCents - perPerson * participantIds.length;

  return participantIds.map((userId, i) => ({
    userId,
    shareCents: perPerson + (i < remainder ? 1 : 0),
  }));
}

export function computeExactSplits(
  participantIds: string[],
  exactAmounts: Record<string, string>,
): ExpenseSplitInput[] {
  return participantIds.map((userId) => ({
    userId,
    shareCents: Math.round(parseFloat(exactAmounts[userId] || "0") * 100),
  }));
}

export function computePercentSplits(
  participantIds: string[],
  percentAmounts: Record<string, string>,
  amountCents: number,
): ExpenseSplitInput[] {
  return participantIds.map((userId) => {
    const pct = parseFloat(percentAmounts[userId] || "0");
    return {
      userId,
      shareCents: Math.round((amountCents * pct) / 100),
      percentShare: pct,
    };
  });
}

export function validateExpenseForm(params: {
  description: string;
  amountText: string;
  amountCents: number;
  paidBy: string | null;
  participantIds: string[];
  dateText: string;
  splitType: SplitType;
  exactAmounts: Record<string, string>;
  percentAmounts: Record<string, string>;
}): string | null {
  const {
    description,
    amountText,
    amountCents,
    paidBy,
    participantIds,
    dateText,
    splitType,
    exactAmounts,
    percentAmounts,
  } = params;

  const trimmedDesc = description.trim();

  if (trimmedDesc.length === 0) {
    return "Description is required.";
  }
  if (trimmedDesc.length > MAX_DESCRIPTION_LENGTH) {
    return "Description can be at most 100 characters.";
  }
  if (amountCents <= 0 || isNaN(parseFloat(amountText))) {
    return "Enter a valid amount greater than $0.";
  }
  if (!paidBy) {
    return "Select who paid.";
  }
  if (participantIds.length < 2) {
    return "Select at least 2 participants.";
  }

  if (splitType === "exact") {
    const splits = computeExactSplits(participantIds, exactAmounts);
    const sum = splits.reduce((s, p) => s + p.shareCents, 0);
    if (sum !== amountCents) {
      return `Exact amounts must add up to ${formatCents(amountCents)}. Currently ${formatCents(sum)}.`;
    }
  } else if (splitType === "percent") {
    const pctSum = participantIds.reduce(
      (s, uid) => s + parseFloat(percentAmounts[uid] || "0"),
      0,
    );
    if (Math.abs(pctSum - 100) > 0.01) {
      return `Percentages must add up to 100%. Currently ${pctSum.toFixed(1)}%.`;
    }
  }

  if (!dateText.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return "Enter a valid date in YYYY-MM-DD format.";
  }

  const parsedDate = new Date(dateText + "T00:00:00");
  if (isNaN(parsedDate.getTime())) {
    return "That date doesn't exist. Check the month and day.";
  }

  return null;
}
