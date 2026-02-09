import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/features/notifications/lib/notification-preferences-repository";
import type {
  NotificationPreferenceKey,
  NotificationPreferencesRow,
} from "@/features/notifications/types/notification-preferences.types";

type UseNotificationPreferencesValue = {
  preferences: NotificationPreferencesRow | null;
  isLoading: boolean;
  error: string | null;
  toggleFriendRequests: (enabled: boolean) => void;
  toggleGroupInvitations: (enabled: boolean) => void;
  toggleExpenseUpdates: (enabled: boolean) => void;
};

export function useNotificationPreferences(): UseNotificationPreferencesValue {
  const { user } = useAuth();
  const [preferences, setPreferences] =
    useState<NotificationPreferencesRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setPreferences(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await getNotificationPreferences(user.id);

    if (result.ok) {
      setPreferences(result.data);
    }

    setIsLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const updateKeys = useCallback(
    (updates: Partial<Record<NotificationPreferenceKey, boolean>>) => {
      if (!user?.id || !preferences) return;

      setError(null);

      // Optimistic update
      setPreferences((prev) => (prev ? { ...prev, ...updates } : prev));

      void (async () => {
        const result = await updateNotificationPreferences(user.id, updates);
        if (result.ok) {
          setPreferences(result.data);
        } else {
          setError(result.message);
          // Revert on failure
          void refresh();
        }
      })();
    },
    [user?.id, preferences, refresh],
  );

  const toggleFriendRequests = useCallback(
    (enabled: boolean) => {
      updateKeys({
        friend_request_received: enabled,
        friend_request_accepted: enabled,
      });
    },
    [updateKeys],
  );

  const toggleGroupInvitations = useCallback(
    (enabled: boolean) => {
      updateKeys({ added_to_group: enabled });
    },
    [updateKeys],
  );

  const toggleExpenseUpdates = useCallback(
    (enabled: boolean) => {
      updateKeys({
        new_expense: enabled,
        settlement_recorded: enabled,
      });
    },
    [updateKeys],
  );

  return {
    preferences,
    isLoading,
    error,
    toggleFriendRequests,
    toggleGroupInvitations,
    toggleExpenseUpdates,
  };
}
