export type ActivityDirection = "you_owe" | "you_are_owed";

export type DashboardActivityItem = {
  id: string;
  title: string;
  groupName: string;
  amount: number;
  direction: ActivityDirection;
  happenedAt: string;
};

export type DashboardSnapshot = {
  totalBalance: number;
  dueSoon: number;
  activeGroups: number;
  pendingRequests: number;
  recentActivity: DashboardActivityItem[];
};

export type GroupBalanceDirection = "you_owe" | "you_are_owed" | "settled";

export type GroupSummary = {
  id: string;
  name: string;
  members: number;
  nextDueAt: string;
  balance: number;
  direction: GroupBalanceDirection;
};

export type ReceiptStatus = "scanned" | "needs_review" | "processed";

export type ReceiptItem = {
  id: string;
  merchant: string;
  groupName: string;
  submittedBy: string;
  status: ReceiptStatus;
  amount: number;
  scannedAt: string;
};

export type SettingsPreview = {
  displayName: string;
  email: string;
  provider: "email" | "google";
  notificationsEnabled: boolean;
  smartRemindersEnabled: boolean;
};

export type FriendBalanceDirection = "you_owe" | "you_are_owed";

export type FriendBalanceSummary = {
  id: string;
  name: string;
  amount: number;
  direction: FriendBalanceDirection;
};

export type FriendActivityItem = {
  id: string;
  title: string;
  amount: number;
  direction: FriendBalanceDirection;
};

export type FriendProfile = {
  id: string;
  name: string;
  balance: number;
  direction: FriendBalanceDirection;
  activity: FriendActivityItem[];
};

export const dashboardSnapshot: DashboardSnapshot = {
  totalBalance: 248.4,
  dueSoon: 64.75,
  activeGroups: 3,
  pendingRequests: 2,
  recentActivity: [
    {
      id: "activity_1",
      title: "Dinner at Moku",
      groupName: "Tokyo Trip",
      amount: 42.5,
      direction: "you_are_owed",
      happenedAt: "2026-02-06T10:40:00.000Z",
    },
    {
      id: "activity_2",
      title: "Weekly groceries",
      groupName: "Roommates",
      amount: 19.25,
      direction: "you_owe",
      happenedAt: "2026-02-05T19:10:00.000Z",
    },
    {
      id: "activity_3",
      title: "Team coffee run",
      groupName: "Work Buddies",
      amount: 11,
      direction: "you_are_owed",
      happenedAt: "2026-02-04T14:20:00.000Z",
    },
  ],
};

export const groupSummaries: GroupSummary[] = [
  {
    id: "group_1",
    name: "Roommates",
    members: 4,
    nextDueAt: "2026-02-08T09:00:00.000Z",
    balance: 36.15,
    direction: "you_owe",
  },
  {
    id: "group_2",
    name: "Tokyo Trip",
    members: 5,
    nextDueAt: "2026-02-12T12:00:00.000Z",
    balance: 145.0,
    direction: "you_are_owed",
  },
  {
    id: "group_3",
    name: "Work Buddies",
    members: 6,
    nextDueAt: "2026-02-10T08:00:00.000Z",
    balance: 0,
    direction: "settled",
  },
];

export const receiptItems: ReceiptItem[] = [
  {
    id: "receipt_1",
    merchant: "Whole Foods",
    groupName: "Roommates",
    submittedBy: "You",
    status: "processed",
    amount: 63.2,
    scannedAt: "2026-02-05T19:16:00.000Z",
  },
  {
    id: "receipt_2",
    merchant: "FamilyMart",
    groupName: "Tokyo Trip",
    submittedBy: "Aanya",
    status: "needs_review",
    amount: 28.4,
    scannedAt: "2026-02-05T08:32:00.000Z",
  },
  {
    id: "receipt_3",
    merchant: "Blue Bottle Coffee",
    groupName: "Work Buddies",
    submittedBy: "You",
    status: "scanned",
    amount: 21.8,
    scannedAt: "2026-02-04T13:52:00.000Z",
  },
];

export const settingsPreview: SettingsPreview = {
  displayName: "Rithvik",
  email: "rithvik1188@gmail.com",
  provider: "google",
  notificationsEnabled: true,
  smartRemindersEnabled: false,
};

export const friendBalances: FriendBalanceSummary[] = [
  { id: "friend_1", name: "Aanya", amount: 42.5, direction: "you_are_owed" },
  { id: "friend_2", name: "Rahul", amount: 18.0, direction: "you_owe" },
  { id: "friend_3", name: "Mira", amount: 9.75, direction: "you_are_owed" },
  { id: "friend_4", name: "Vikram", amount: 31.1, direction: "you_owe" },
];

export const friendProfiles: FriendProfile[] = [
  {
    id: "friend_1",
    name: "Aanya",
    balance: 42.5,
    direction: "you_are_owed",
    activity: [
      {
        id: "friend_activity_1",
        title: "Concert tickets",
        amount: 30,
        direction: "you_are_owed",
      },
      {
        id: "friend_activity_2",
        title: "Dinner split",
        amount: 12.5,
        direction: "you_are_owed",
      },
    ],
  },
  {
    id: "friend_2",
    name: "Rahul",
    balance: 18,
    direction: "you_owe",
    activity: [
      {
        id: "friend_activity_3",
        title: "Cab fare",
        amount: 8,
        direction: "you_owe",
      },
      {
        id: "friend_activity_4",
        title: "Coffee run",
        amount: 10,
        direction: "you_owe",
      },
    ],
  },
  {
    id: "friend_3",
    name: "Mira",
    balance: 9.75,
    direction: "you_are_owed",
    activity: [
      {
        id: "friend_activity_5",
        title: "Brunch split",
        amount: 9.75,
        direction: "you_are_owed",
      },
    ],
  },
  {
    id: "friend_4",
    name: "Vikram",
    balance: 31.1,
    direction: "you_owe",
    activity: [
      {
        id: "friend_activity_6",
        title: "Movie tickets",
        amount: 20,
        direction: "you_owe",
      },
      {
        id: "friend_activity_7",
        title: "Snacks",
        amount: 11.1,
        direction: "you_owe",
      },
    ],
  },
];

export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

export function formatShortDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(parsed);
  } catch {
    return parsed.toISOString().slice(0, 10);
  }
}

export function findFriendProfile(friendId: string): FriendProfile | undefined {
  return friendProfiles.find((profile) => profile.id === friendId);
}
