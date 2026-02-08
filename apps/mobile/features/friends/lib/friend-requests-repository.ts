import { supabase } from "@/features/auth/lib/supabase-client";
import type {
  CancelFriendRequestRow,
  DirectFriendGroupRow,
  FriendRequest,
  FriendRequestStatus,
  FriendSearchCandidate,
  FriendSearchCandidateRow,
  IncomingFriendRequestRow,
  OutgoingFriendRequestRow,
  RespondFriendRequestRow,
  SendFriendRequestRow,
} from "@/features/friends/types/friend-request.types";

type FriendRequestsResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export const FRIEND_REQUESTS_RPC_UNAVAILABLE_MESSAGE =
  "Friend requests are temporarily unavailable due to a backend update. Please apply latest DB migrations and retry.";

const friendRequestRpcNames = [
  "search_friend_candidates",
  "send_friend_request",
  "list_incoming_friend_requests",
  "list_outgoing_friend_requests",
  "respond_to_friend_request",
  "cancel_friend_request",
  "get_direct_friend_group",
  "ensure_direct_friend_group",
];

function mapSearchCandidateRow(
  row: FriendSearchCandidateRow,
): FriendSearchCandidate {
  return {
    userId: row.id,
    displayName: row.display_name,
    email: row.email,
    relationshipStatus: row.relationship_status,
  };
}

function mapIncomingRequestRow(row: IncomingFriendRequestRow): FriendRequest {
  return {
    requestId: row.request_id,
    otherUserId: row.requester_id,
    displayName: row.display_name,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
    direction: "incoming",
  };
}

function mapOutgoingRequestRow(row: OutgoingFriendRequestRow): FriendRequest {
  return {
    requestId: row.request_id,
    otherUserId: row.addressee_id,
    displayName: row.display_name,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
    direction: "outgoing",
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
  const referencesFriendRequestRpc = friendRequestRpcNames.some((rpcName) =>
    normalizedMessage.includes(rpcName),
  );

  if (
    normalizedCode === "PGRST202" ||
    normalizedCode === "42883" ||
    (normalizedMessage.includes("schema cache") && referencesFriendRequestRpc)
  ) {
    return FRIEND_REQUESTS_RPC_UNAVAILABLE_MESSAGE;
  }

  if (normalizedCode === "42501") {
    return "You do not have permission for this action.";
  }

  if (normalizedMessage.includes("network")) {
    return "Network issue while contacting Supabase. Try again.";
  }

  return error.message || fallbackMessage;
}

export async function searchFriendCandidates(
  query: string,
  limit = 8,
): Promise<FriendRequestsResult<FriendSearchCandidate[]>> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return { ok: true, data: [] };
  }

  const { data, error } = await supabase.rpc("search_friend_candidates", {
    p_query: normalizedQuery,
    p_limit: limit,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to search users.", error),
    };
  }

  const rows = (data ?? []) as FriendSearchCandidateRow[];

  return {
    ok: true,
    data: rows.map(mapSearchCandidateRow),
  };
}

export async function listIncomingFriendRequests(
  status: FriendRequestStatus | null = "pending",
): Promise<FriendRequestsResult<FriendRequest[]>> {
  const { data, error } = await supabase.rpc("list_incoming_friend_requests", {
    p_status: status,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load incoming requests.", error),
    };
  }

  const rows = (data ?? []) as IncomingFriendRequestRow[];

  return {
    ok: true,
    data: rows.map(mapIncomingRequestRow),
  };
}

export async function listOutgoingFriendRequests(
  status: FriendRequestStatus | null = "pending",
): Promise<FriendRequestsResult<FriendRequest[]>> {
  const { data, error } = await supabase.rpc("list_outgoing_friend_requests", {
    p_status: status,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load outgoing requests.", error),
    };
  }

  const rows = (data ?? []) as OutgoingFriendRequestRow[];

  return {
    ok: true,
    data: rows.map(mapOutgoingRequestRow),
  };
}

export async function sendFriendRequest(
  targetUserId: string,
): Promise<
  FriendRequestsResult<{ requestId: string; status: FriendRequestStatus }>
> {
  const { data, error } = await supabase.rpc("send_friend_request", {
    p_target_user_id: targetUserId,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to send friend request.", error),
    };
  }

  const rows = (data ?? []) as SendFriendRequestRow[];
  const row = rows[0];

  if (!row) {
    return {
      ok: false,
      message: "Friend request did not return a result.",
    };
  }

  return {
    ok: true,
    data: {
      requestId: row.request_id,
      status: row.status,
    },
  };
}

export async function respondToFriendRequest(
  requestId: string,
  action: "accept" | "decline",
): Promise<
  FriendRequestsResult<{
    requestId: string;
    status: FriendRequestStatus;
    directGroupId: string | null;
  }>
> {
  const { data, error } = await supabase.rpc("respond_to_friend_request", {
    p_request_id: requestId,
    p_action: action,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to respond to friend request.", error),
    };
  }

  const rows = (data ?? []) as RespondFriendRequestRow[];
  const row = rows[0];

  if (!row) {
    return {
      ok: false,
      message: "Friend request response did not return a result.",
    };
  }

  return {
    ok: true,
    data: {
      requestId: row.request_id,
      status: row.status,
      directGroupId: row.direct_group_id,
    },
  };
}

export async function cancelFriendRequest(
  requestId: string,
): Promise<
  FriendRequestsResult<{ requestId: string; status: FriendRequestStatus }>
> {
  const { data, error } = await supabase.rpc("cancel_friend_request", {
    p_request_id: requestId,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to cancel friend request.", error),
    };
  }

  const rows = (data ?? []) as CancelFriendRequestRow[];
  const row = rows[0];

  if (!row) {
    return {
      ok: false,
      message: "Friend request cancel did not return a result.",
    };
  }

  return {
    ok: true,
    data: {
      requestId: row.request_id,
      status: row.status,
    },
  };
}

export async function getDirectFriendGroup(
  friendId: string,
): Promise<FriendRequestsResult<string | null>> {
  const { data, error } = await supabase.rpc("get_direct_friend_group", {
    p_friend_id: friendId,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError("Unable to load direct friend group.", error),
    };
  }

  const rows = (data ?? []) as DirectFriendGroupRow[];
  return {
    ok: true,
    data: rows[0]?.direct_group_id ?? null,
  };
}

export async function ensureDirectFriendGroup(
  friendId: string,
): Promise<FriendRequestsResult<string>> {
  const { data, error } = await supabase.rpc("ensure_direct_friend_group", {
    p_friend_id: friendId,
  });

  if (error) {
    return {
      ok: false,
      message: normalizeError(
        "Unable to start a direct split with this friend.",
        error,
      ),
    };
  }

  const rows = (data ?? []) as DirectFriendGroupRow[];
  const directGroupId = rows[0]?.direct_group_id ?? null;

  if (!directGroupId) {
    return {
      ok: false,
      message: "Could not resolve a direct split group for this friend.",
    };
  }

  return {
    ok: true,
    data: directGroupId,
  };
}
