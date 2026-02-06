import { supabase } from "@/features/auth/lib/supabase-client";
import type {
  CreateGroupInput,
  Group,
  GroupRow,
} from "@/features/groups/types/group.types";

const groupColumns =
  "id, name, emoji, group_type, created_by, created_at, updated_at";

type GroupsRepositoryResult<T> = { ok: true; data: T } | { ok: false; message: string };

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

export async function listGroupsForUser(
  userId: string,
): Promise<GroupsRepositoryResult<Group[]>> {
  const { data, error } = await supabase
    .from("groups")
    .select(groupColumns)
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      ok: false,
      message: normalizeGroupsError("Unable to load groups right now.", error),
    };
  }

  const rows = (data ?? []) as GroupRow[];

  return {
    ok: true,
    data: rows.map(mapGroupRow),
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
