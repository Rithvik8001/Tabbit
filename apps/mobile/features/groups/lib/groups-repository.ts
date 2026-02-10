import { supabase } from "@/features/auth/lib/supabase-client";
import type {
  CreateGroupInput,
  GroupBalanceSummary,
  GroupBalanceSummaryRow,
  Group,
  GroupListItem,
  GroupListRow,
  GroupRow,
  UpdateGroupInput,
} from "@/features/groups/types/group.types";

const groupColumns =
  "id, name, emoji, group_type, created_by, created_at, updated_at";

const groupListColumns =
  "id, name, emoji, group_type, created_by, created_at, updated_at, group_members(count), expenses(count)";

type GroupsRepositoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function mapGroupRow(row: GroupRow): Group {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    groupType: row.group_type,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGroupListRow(row: GroupListRow): GroupListItem {
  return {
    ...mapGroupRow(row),
    memberCount: row.group_members?.[0]?.count ?? 0,
    expenseCount: row.expenses?.[0]?.count ?? 0,
  };
}

function toSafeNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDirection(value: string): GroupBalanceSummary["direction"] {
  if (value === "you_are_owed") {
    return "you_are_owed";
  }

  if (value === "you_owe") {
    return "you_owe";
  }

  return "settled";
}

function mapGroupBalanceSummaryRow(row: GroupBalanceSummaryRow): GroupBalanceSummary {
  return {
    groupId: row.group_id,
    netCents: toSafeNumber(row.net_cents),
    direction: normalizeDirection(row.direction),
  };
}

function normalizeGroupsError(
  fallbackMessage: string,
  error: { message: string; code?: string | null } | null,
): string {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === "42501") {
    return "You don't have access to this group data.";
  }

  if (error.code === "23514") {
    return "Group details are invalid. Check the name, type, and emoji.";
  }

  if (error.code === "23502") {
    return "Required group fields are missing.";
  }

  if (error.message.toLowerCase().includes("network")) {
    return "Network issue while contacting Supabase. Try again.";
  }

  return error.message || fallbackMessage;
}

export async function listGroupsForUser(): Promise<
  GroupsRepositoryResult<GroupListItem[]>
> {
  const { data, error } = await supabase
    .from("groups")
    .select(groupListColumns)
    .eq("group_kind", "standard")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      ok: false,
      message: normalizeGroupsError("Unable to load groups right now.", error),
    };
  }

  const rows = (data ?? []) as GroupListRow[];

  return {
    ok: true,
    data: rows.map(mapGroupListRow),
  };
}

export async function getGroupBalanceSummaries(): Promise<
  GroupsRepositoryResult<GroupBalanceSummary[]>
> {
  const { data, error } = await supabase.rpc("get_group_balance_summaries");

  if (error) {
    return {
      ok: false,
      message: normalizeGroupsError("Unable to load group balances right now.", error),
    };
  }

  const rows = (data ?? []) as GroupBalanceSummaryRow[];

  return {
    ok: true,
    data: rows.map(mapGroupBalanceSummaryRow),
  };
}

export async function getGroupById(
  groupId: string,
): Promise<GroupsRepositoryResult<Group>> {
  const { data, error } = await supabase
    .from("groups")
    .select(groupColumns)
    .eq("id", groupId)
    .single();

  if (error) {
    return {
      ok: false,
      message: normalizeGroupsError("Unable to load this group.", error),
    };
  }

  return {
    ok: true,
    data: mapGroupRow(data as GroupRow),
  };
}

export async function createGroup(
  input: CreateGroupInput,
  userId: string,
): Promise<GroupsRepositoryResult<Group>> {
  const { data, error } = await supabase
    .from("groups")
    .insert({
      name: input.name.trim(),
      emoji: input.emoji.trim(),
      group_type: input.groupType,
      created_by: userId,
    })
    .select(groupColumns)
    .single();

  if (error) {
    return {
      ok: false,
      message: normalizeGroupsError("Unable to create this group.", error),
    };
  }

  return {
    ok: true,
    data: mapGroupRow(data as GroupRow),
  };
}

export async function updateGroup(
  groupId: string,
  input: UpdateGroupInput,
): Promise<GroupsRepositoryResult<Group>> {
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.emoji !== undefined) updates.emoji = input.emoji.trim();
  if (input.groupType !== undefined) updates.group_type = input.groupType;

  const { data, error } = await supabase
    .from("groups")
    .update(updates)
    .eq("id", groupId)
    .select(groupColumns)
    .single();

  if (error) {
    return {
      ok: false,
      message: normalizeGroupsError("Unable to update this group.", error),
    };
  }

  return {
    ok: true,
    data: mapGroupRow(data as GroupRow),
  };
}

export async function deleteGroup(
  groupId: string,
): Promise<GroupsRepositoryResult<void>> {
  const { error } = await supabase.from("groups").delete().eq("id", groupId);

  if (error) {
    return {
      ok: false,
      message: normalizeGroupsError("Unable to delete this group.", error),
    };
  }

  return { ok: true, data: undefined };
}
