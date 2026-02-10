import { supabase } from "@/features/auth/lib/supabase-client";
import type {
  GroupMemberCandidate,
  GroupMemberCandidateRow,
  GroupMember,
  GroupMemberRow,
} from "@/features/groups/types/group-member.types";

type GroupMembersResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

type RemoveGroupMemberRpcRow = {
  id: string;
  group_id: string;
  user_id: string;
};

const memberColumns =
  "id, group_id, user_id, role, joined_at, profiles!group_members_user_id_profiles_fk(display_name, email)";

function mapMemberRow(row: GroupMemberRow): GroupMember {
  const profile = Array.isArray(row.profiles)
    ? (row.profiles[0] ?? null)
    : (row.profiles ?? null);
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

function mapCandidateRow(row: GroupMemberCandidateRow): GroupMemberCandidate {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
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

  const normalizedMessage = error.message.toLowerCase();

  if (normalizedMessage.includes("must be settled up")) {
    return "Settle balances with this member before removing them.";
  }

  if (normalizedMessage.includes("only admins can remove other members")) {
    return "Only admins can remove other members in this group.";
  }

  if (normalizedMessage.includes("group member not found")) {
    return "This member no longer exists in the group.";
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

export async function addGroupMemberByUserId(
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
  const { data, error } = await supabase.rpc("remove_group_member_if_settled", {
    p_group_member_id: memberId,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to remove member.", error),
    };
  }

  const rows = (data ?? []) as RemoveGroupMemberRpcRow[];
  if (rows.length === 0) {
    return {
      ok: false,
      message: "Unable to remove member.",
    };
  }

  return { ok: true, data: undefined };
}

export async function searchGroupMemberCandidates(
  groupId: string,
  query: string,
  limit = 8,
): Promise<GroupMembersResult<GroupMemberCandidate[]>> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return { ok: true, data: [] };
  }

  const { data, error } = await supabase.rpc("search_group_member_candidates", {
    p_group_id: groupId,
    p_query: normalizedQuery,
    p_limit: limit,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to search users.", error),
    };
  }

  const rows = (data ?? []) as GroupMemberCandidateRow[];

  return {
    ok: true,
    data: rows.map(mapCandidateRow),
  };
}

export async function findGroupMemberCandidateByEmail(
  groupId: string,
  email: string,
): Promise<GroupMembersResult<GroupMemberCandidate>> {
  const { data, error } = await supabase.rpc(
    "find_group_member_candidate_by_email",
    {
      p_group_id: groupId,
      p_email: email.trim(),
    },
  );

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to look up user.", error),
    };
  }

  const rows = data as GroupMemberCandidateRow[] | null;

  if (!rows || rows.length === 0) {
    return {
      ok: false,
      message: "No available user found with that email address.",
    };
  }

  return {
    ok: true,
    data: mapCandidateRow(rows[0]),
  };
}

export async function findUserByEmail(
  groupId: string,
  email: string,
): Promise<GroupMembersResult<GroupMemberCandidate>> {
  const result = await findGroupMemberCandidateByEmail(groupId, email);

  if (!result.ok) {
    if (result.message === "No available user found with that email address.") {
      return {
        ok: false,
        message: "No user found with that email address.",
      };
    }

    return result;
  }

  return result;
}

export async function addGroupMember(
  groupId: string,
  userId: string,
): Promise<GroupMembersResult<GroupMember>> {
  return await addGroupMemberByUserId(groupId, userId);
}
