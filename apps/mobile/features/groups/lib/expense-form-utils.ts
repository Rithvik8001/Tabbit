import type { SplitType, ExpenseSplitInput } from "@/features/groups/types/expense.types";
import { formatCents } from "@/features/groups/lib/format-currency";
import { isValidDateOnly } from "@/features/shared/lib/date-only";

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
  if (participantIds.length === 0) {
    return [];
  }

  const drafts = participantIds.map((userId, index) => {
    const parsedPercent = Number.parseFloat(percentAmounts[userId] || "0");
    const percentShare = Number.isFinite(parsedPercent) ? parsedPercent : 0;
    const rawShare = (amountCents * percentShare) / 100;
    const flooredShare = Math.floor(rawShare);

    return {
      userId,
      index,
      percentShare,
      shareCents: flooredShare,
      fractional: rawShare - flooredShare,
    };
  });

  const baseSum = drafts.reduce((sum, item) => sum + item.shareCents, 0);
  let remainder = amountCents - baseSum;

  if (remainder !== 0) {
    const ordered = [...drafts].sort((a, b) => {
      if (remainder > 0) {
        return b.fractional - a.fractional || a.index - b.index;
      }
      return a.fractional - b.fractional || a.index - b.index;
    });

    let cursor = 0;
    while (remainder !== 0 && ordered.length > 0) {
      const current = ordered[cursor % ordered.length];

      if (remainder > 0) {
        current.shareCents += 1;
        remainder -= 1;
      } else if (current.shareCents > 0) {
        current.shareCents -= 1;
        remainder += 1;
      }

      cursor += 1;
      if (cursor > participantIds.length * 1000) {
        break;
      }
    }
  }

  return drafts
    .sort((a, b) => a.index - b.index)
    .map((item) => ({
      userId: item.userId,
      shareCents: item.shareCents,
      percentShare: item.percentShare,
    }));
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
    const percentages = participantIds.map((uid) =>
      Number.parseFloat(percentAmounts[uid] || "0"),
    );

    if (percentages.some((value) => !Number.isFinite(value))) {
      return "Enter valid percentages for each participant.";
    }

    if (percentages.some((value) => value < 0 || value > 100)) {
      return "Each percentage must be between 0 and 100.";
    }

    const pctSum = percentages.reduce((sum, value) => sum + value, 0);
    if (Math.abs(pctSum - 100) > 0.01) {
      return `Percentages must add up to 100%. Currently ${pctSum.toFixed(1)}%.`;
    }

    const splits = computePercentSplits(participantIds, percentAmounts, amountCents);
    const splitSum = splits.reduce((sum, split) => sum + split.shareCents, 0);
    if (splitSum !== amountCents) {
      return `Percent splits must add up to ${formatCents(amountCents)}. Currently ${formatCents(splitSum)}.`;
    }
  }

  if (!dateText.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return "Enter a valid date in YYYY-MM-DD format.";
  }

  if (!isValidDateOnly(dateText)) {
    return "That date doesn't exist. Check the month and day.";
  }

  return null;
}
