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
};

export type GroupListRow = GroupRow & {
  group_members: { count: number }[];
};
