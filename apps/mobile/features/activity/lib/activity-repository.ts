import { supabase } from "@/features/auth/lib/supabase-client";
import type {
  ActivityFeedItem,
  ActivityFeedRow,
  ActivityDirection,
  ActivityEventType,
} from "@/features/activity/types/activity.types";

type ActivityRepositoryResult<T> =
  | { ok: true; data: T; hasMore: boolean }
  | { ok: false; message: string };

export const ACTIVITY_RPC_UNAVAILABLE_MESSAGE =
  "Activity is temporarily unavailable due to a backend update. Please apply latest DB migrations and retry.";

function toSafeNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeEventType(value: string): ActivityEventType {
  if (value === "settlement" || value === "group_joined") {
    return value;
  }

  return "expense";
}

function normalizeDirection(value: string): ActivityDirection {
  if (value === "you_are_owed" || value === "settled") {
    return value;
  }

  return "you_owe";
}

function mapActivityRow(row: ActivityFeedRow): ActivityFeedItem {
  return {
    eventId: row.event_id,
    eventType: normalizeEventType(row.event_type),
    occurredAt: row.occurred_at,
    groupId: row.group_id,
    groupName: row.group_name,
    groupEmoji: row.group_emoji,
    groupKind: row.group_kind,
    actorUserId: row.actor_user_id,
    actorDisplayName: row.actor_display_name,
    expenseId: row.expense_id,
    description: row.description ?? "",
    amountCents:
      row.amount_cents === null || row.amount_cents === undefined
        ? null
        : toSafeNumber(row.amount_cents),
    netCents: toSafeNumber(row.net_cents),
    direction: normalizeDirection(row.direction),
    receiptAttached: Boolean(row.receipt_attached),
  };
}

function normalizeError(
  fallbackMessage: string,
  error: { message: string; code?: string | null } | null,
): string {
  if (!error) {
    return fallbackMessage;
  }

  const normalizedMessage = error.message.toLowerCase();
  const normalizedCode = (error.code ?? "").toUpperCase();
  const referencesActivityRpc = normalizedMessage.includes("get_activity_feed");

  if (
    normalizedCode === "PGRST202" ||
    normalizedCode === "42883" ||
    (normalizedMessage.includes("schema cache") && referencesActivityRpc)
  ) {
    return ACTIVITY_RPC_UNAVAILABLE_MESSAGE;
  }

  if (normalizedMessage.includes("network")) {
    return "Network issue while contacting Supabase. Try again.";
  }

  return error.message || fallbackMessage;
}

function clampLimit(value: number): number {
  if (!Number.isFinite(value)) return 25;
  return Math.max(1, Math.min(Math.floor(value), 100));
}

function clampOffset(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

export async function listActivityFeedPage(
  limit = 25,
  offset = 0,
): Promise<ActivityRepositoryResult<ActivityFeedItem[]>> {
  const pageSize = clampLimit(limit);
  const pageOffset = clampOffset(offset);
  const requestSize = Math.min(pageSize + 1, 100);

  const { data, error } = await supabase.rpc("get_activity_feed", {
    p_limit: requestSize,
    p_offset: pageOffset,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load activity.", error),
    };
  }

  const rows = (data ?? []) as ActivityFeedRow[];
  const mapped = rows.map(mapActivityRow);
  const hasMore = mapped.length > pageSize;

  return {
    ok: true,
    data: hasMore ? mapped.slice(0, pageSize) : mapped,
    hasMore,
  };
}
