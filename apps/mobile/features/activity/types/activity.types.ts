export type ActivityEventType = "expense" | "settlement" | "group_joined";

export type ActivityDirection = "you_owe" | "you_are_owed" | "settled";

export type ActivityFeedRow = {
  event_id: string;
  event_type: ActivityEventType;
  occurred_at: string;
  group_id: string;
  group_name: string;
  group_emoji: string | null;
  group_kind: "standard" | "direct_friendship";
  actor_user_id: string | null;
  actor_display_name: string | null;
  expense_id: string | null;
  description: string | null;
  amount_cents: number | string | null;
  net_cents: number | string;
  direction: ActivityDirection;
  receipt_attached: boolean | null;
};

export type ActivityFeedItem = {
  eventId: string;
  eventType: ActivityEventType;
  occurredAt: string;
  groupId: string;
  groupName: string;
  groupEmoji: string | null;
  groupKind: "standard" | "direct_friendship";
  actorUserId: string | null;
  actorDisplayName: string | null;
  expenseId: string | null;
  description: string;
  amountCents: number | null;
  netCents: number;
  direction: ActivityDirection;
  receiptAttached: boolean;
};

export type ActivityEventFilter =
  | "all"
  | "expense"
  | "settlement"
  | "group_joined";

export type ActivityImpactFilter = "all" | "you_owe" | "owes_you" | "no_impact";

export type ActivityRowVM = {
  id: string;
  eventType: ActivityEventType;
  direction: ActivityDirection;
  groupId: string;
  groupName: string;
  actorDisplayName: string | null;
  title: string;
  subtitle: string;
  timestampLabel: string;
  statusLabel: string;
  amountText?: string;
  hasReceipt: boolean;
  tone: "positive" | "negative" | "neutral";
};
