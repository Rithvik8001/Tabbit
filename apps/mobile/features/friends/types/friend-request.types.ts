export type FriendRequestStatus = "pending" | "accepted" | "declined" | "canceled";

export type FriendRelationshipStatus =
  | "can_request"
  | "outgoing_pending"
  | "incoming_pending"
  | "already_friend";

export type FriendRequestDirection = "incoming" | "outgoing";

export type FriendSearchCandidateRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  relationship_status: FriendRelationshipStatus;
};

export type FriendSearchCandidate = {
  userId: string;
  displayName: string | null;
  email: string | null;
  relationshipStatus: FriendRelationshipStatus;
};

export type IncomingFriendRequestRow = {
  request_id: string;
  requester_id: string;
  display_name: string | null;
  email: string | null;
  status: FriendRequestStatus;
  created_at: string;
};

export type OutgoingFriendRequestRow = {
  request_id: string;
  addressee_id: string;
  display_name: string | null;
  email: string | null;
  status: FriendRequestStatus;
  created_at: string;
};

export type FriendRequest = {
  requestId: string;
  otherUserId: string;
  displayName: string | null;
  email: string | null;
  status: FriendRequestStatus;
  createdAt: string;
  direction: FriendRequestDirection;
};

export type SendFriendRequestRow = {
  request_id: string;
  status: FriendRequestStatus;
};

export type RespondFriendRequestRow = {
  request_id: string;
  status: FriendRequestStatus;
  direct_group_id: string | null;
};

export type CancelFriendRequestRow = {
  request_id: string;
  status: FriendRequestStatus;
};

export type DirectFriendGroupRow = {
  direct_group_id: string;
};
