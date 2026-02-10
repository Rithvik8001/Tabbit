import type { FilterChip } from "@/design/primitives/filter-chip-row";

// ── Balance filter ──────────────────────────────────────────────────

export type BalanceFilter = "all" | "you_owe" | "owes_you" | "settled";

export const BALANCE_CHIPS: readonly FilterChip<BalanceFilter>[] = [
  { key: "all", label: "All" },
  { key: "you_owe", label: "You owe" },
  { key: "owes_you", label: "Owes you" },
  { key: "settled", label: "Settled up" },
];

// ── Friend sort ─────────────────────────────────────────────────────

export type FriendSort = "balance" | "alpha";

export const FRIEND_SORT_CHIPS: readonly FilterChip<FriendSort>[] = [
  { key: "balance", label: "By amount" },
  { key: "alpha", label: "A \u2013 Z" },
];

// ── Group sort ──────────────────────────────────────────────────────

export type GroupSort = "balance" | "newest";

export const GROUP_SORT_CHIPS: readonly FilterChip<GroupSort>[] = [
  { key: "balance", label: "By amount" },
  { key: "newest", label: "Newest" },
];

// ── Filter predicate ────────────────────────────────────────────────

export function matchesBalanceFilter(
  direction: "you_owe" | "you_are_owed" | "settled",
  filter: BalanceFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "you_owe") return direction === "you_owe";
  if (filter === "owes_you") return direction === "you_are_owed";
  return direction === "settled";
}

/** Map GroupStatus tone to a direction string for `matchesBalanceFilter`. */
export function toneToDirection(
  tone: "positive" | "negative" | "neutral",
): "you_owe" | "you_are_owed" | "settled" {
  if (tone === "positive") return "you_are_owed";
  if (tone === "negative") return "you_owe";
  return "settled";
}

// ── Sort helpers ────────────────────────────────────────────────────

export function sortFriends<
  T extends {
    displayName: string | null;
    email: string | null;
    netCents: number;
  },
>(items: T[], sort: FriendSort): T[] {
  const copy = [...items];
  if (sort === "alpha") {
    return copy.sort((a, b) => {
      const aName = (a.displayName ?? a.email ?? "").toLowerCase();
      const bName = (b.displayName ?? b.email ?? "").toLowerCase();
      return aName.localeCompare(bName);
    });
  }
  // "balance" — descending by absolute value
  return copy.sort(
    (a, b) => Math.abs(b.netCents) - Math.abs(a.netCents),
  );
}

export function sortGroups<T extends { netCents: number; createdAt: string }>(
  items: T[],
  sort: GroupSort,
): T[] {
  const copy = [...items];
  if (sort === "newest") {
    return copy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  // "balance" — descending by absolute value
  return copy.sort(
    (a, b) => Math.abs(b.netCents) - Math.abs(a.netCents),
  );
}
