import * as Haptics from "expo-haptics";

export const hapticTokens = {
  press: Haptics.ImpactFeedbackStyle.Heavy,
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
  selection: true,
} as const;

export type HapticTokens = typeof hapticTokens;
