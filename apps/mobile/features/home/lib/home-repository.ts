import { supabase } from "@/features/auth/lib/supabase-client";
import type {
  HomeActivityItem,
  HomeActivityRow,
  HomeActivityDirection,
  HomeSnapshot,
  HomeSnapshotRow,
} from "@/features/home/types/home.types";

type HomeRepositoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function toSafeNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDirection(value: string): HomeActivityDirection {
  return value === "you_are_owed" ? "you_are_owed" : "you_owe";
}

function mapSnapshotRow(row: HomeSnapshotRow): HomeSnapshot {
  return {
    netBalanceCents: toSafeNumber(row.net_balance_cents),
    youOweCents: toSafeNumber(row.you_owe_cents),
    youAreOwedCents: toSafeNumber(row.you_are_owed_cents),
    unsettledGroupsCount: toSafeNumber(row.unsettled_groups_count),
    activeGroupsCount: toSafeNumber(row.active_groups_count),
  };
}

function mapActivityRow(row: HomeActivityRow): HomeActivityItem {
  return {
    expenseId: row.expense_id,
    groupId: row.group_id,
    groupName: row.group_name,
    groupEmoji: row.group_emoji,
    description: row.description,
    entryType: row.entry_type,
    expenseDate: row.expense_date,
    createdAt: row.created_at,
    netCents: toSafeNumber(row.net_cents),
    direction: normalizeDirection(row.direction),
  };
}

function normalizeError(
  fallbackMessage: string,
  error: { message: string; code?: string | null } | null,
): string {
  if (!error) {
    return fallbackMessage;
  }

  if (error.message.toLowerCase().includes("network")) {
    return "Network issue while contacting Supabase. Try again.";
  }

  return error.message || fallbackMessage;
}

export async function getHomeSnapshot(): Promise<
  HomeRepositoryResult<HomeSnapshot>
> {
  const { data, error } = await supabase.rpc("get_home_snapshot");

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load dashboard summary.", error),
    };
  }

  const rows = (data ?? []) as HomeSnapshotRow[];
  const row = rows[0];

  if (!row) {
    return {
      ok: true,
      data: {
        netBalanceCents: 0,
        youOweCents: 0,
        youAreOwedCents: 0,
        unsettledGroupsCount: 0,
        activeGroupsCount: 0,
      },
    };
  }

  return {
    ok: true,
    data: mapSnapshotRow(row),
  };
}

export async function listHomeRecentActivity(
  limit = 10,
): Promise<HomeRepositoryResult<HomeActivityItem[]>> {
  const { data, error } = await supabase.rpc("get_home_recent_activity", {
    p_limit: limit,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load dashboard activity.", error),
    };
  }

  const rows = (data ?? []) as HomeActivityRow[];

  return {
    ok: true,
    data: rows.map(mapActivityRow),
  };
}
