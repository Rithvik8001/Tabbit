export type NotificationPreferencesRow = {
  user_id: string;
  friend_request_received: boolean;
  friend_request_accepted: boolean;
  added_to_group: boolean;
  new_expense: boolean;
  settlement_recorded: boolean;
  created_at: string;
  updated_at: string;
};

export type NotificationPreferenceKey =
  | "friend_request_received"
  | "friend_request_accepted"
  | "added_to_group"
  | "new_expense"
  | "settlement_recorded";
