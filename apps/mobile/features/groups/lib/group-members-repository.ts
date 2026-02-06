import { supabase } from "@/features/auth/lib/supabase-client";
import type {
  GroupMember,
  GroupMemberRow,
} from "@/features/groups/types/group-member.types";

type GroupMembersResult<T> = { ok: true; data: T } | { ok: false; message: string };

const memberColumns = "id, group_id, user_id, role, joined_at, profiles(display_name, email)";

function mapMemberRow(row: GroupMemberRow): GroupMember {
  const profile = row.profiles?.[0] ?? null;
  return {
    id: row.id,
    groupId: row.group_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    displayName: profile?.display_name ?? null,
    email: profile?.email ?? null,
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
    return "You don't have permission to manage members in this group.";
  }

  if (error.code === "23505") {
    return "This user is already a member of the group.";
  }

  if (error.message.toLowerCase().includes("network")) {
    return "Network issue while contacting Supabase. Try again.";
  }

  return error.message || fallbackMessage;
}

export async function listGroupMembers(
  groupId: string,
): Promise<GroupMembersResult<GroupMember[]>> {
  const { data, error } = await supabase
    .from("group_members")
    .select(memberColumns)
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load group members.", error),
    };
  }

  const rows = (data ?? []) as GroupMemberRow[];

  return {
    ok: true,
    data: rows.map(mapMemberRow),
  };
}

export async function addGroupMember(
  groupId: string,
  userId: string,
): Promise<GroupMembersResult<GroupMember>> {
  const { data, error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: userId })
    .select(memberColumns)
    .single();

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to add member.", error),
    };
  }

  return {
    ok: true,
    data: mapMemberRow(data as GroupMemberRow),
  };
}

export async function removeGroupMember(
  memberId: string,
): Promise<GroupMembersResult<void>> {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to remove member.", error),
    };
  }

  return { ok: true, data: undefined };
}

export async function findUserByEmail(
  email: string,
): Promise<GroupMembersResult<{ id: string; displayName: string | null; email: string | null }>> {
  const { data, error } = await supabase.rpc("find_user_id_by_email", {
    p_email: email.trim(),
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to look up user.", error),
    };
  }

  const rows = data as { id: string; display_name: string | null; email: string | null }[] | null;

  if (!rows || rows.length === 0) {
    return {
      ok: false,
      message: "No user found with that email address.",
    };
  }

  const user = rows[0];

  return {
    ok: true,
    data: {
      id: user.id,
      displayName: user.display_name,
      email: user.email,
    },
  };
}
