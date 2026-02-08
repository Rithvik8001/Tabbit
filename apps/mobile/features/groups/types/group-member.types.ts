export type MemberRole = "admin" | "member";

export type GroupMember = {
  id: string;
  groupId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  displayName: string | null;
  email: string | null;
};

export type GroupMemberRow = {
  id: string;
  group_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profiles:
    | { display_name: string | null; email: string | null }[]
    | { display_name: string | null; email: string | null }
    | null;
};

export type GroupMemberCandidateRow = {
  id: string;
  display_name: string;
  email: string | null;
};

export type GroupMemberCandidate = {
  id: string;
  displayName: string;
  email: string | null;
};
