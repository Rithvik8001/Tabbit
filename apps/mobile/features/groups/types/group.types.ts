export type GroupType = "trip" | "home" | "couple" | "other";

export type Group = {
  id: string;
  name: string;
  emoji: string;
  groupType: GroupType;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type GroupRow = {
  id: string;
  name: string;
  emoji: string;
  group_type: GroupType;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CreateGroupInput = {
  name: string;
  emoji: string;
  groupType: GroupType;
};

export type UpdateGroupInput = {
  name?: string;
  emoji?: string;
  groupType?: GroupType;
};

export type GroupListItem = Group & {
  memberCount: number;
  expenseCount: number;
};

export type GroupListRowVM = {
  id: string;
  title: string;
  subtitle: string | null;
  leadingEmoji: string | null;
  statusState: "ready" | "loading" | "unavailable";
  statusLabel: string;
  statusAmount: string | null;
  tone: "positive" | "negative" | "neutral";
};

export type GroupListRow = GroupRow & {
  group_members: { count: number }[];
  expenses: { count: number }[];
};

export type GroupBalanceDirection = "you_owe" | "you_are_owed" | "settled";

export type GroupBalanceSummary = {
  groupId: string;
  netCents: number;
  direction: GroupBalanceDirection;
};

export type GroupBalanceSummaryRow = {
  group_id: string;
  net_cents: number | string;
  direction: string;
};
