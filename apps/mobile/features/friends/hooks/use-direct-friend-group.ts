import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import {
  ensureDirectFriendGroup as ensureDirectFriendGroupRecord,
  getDirectFriendGroup,
} from "@/features/friends/lib/friend-requests-repository";

type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string };

type UseDirectFriendGroupValue = {
  directGroupId: string | null;
  isLoading: boolean;
  isEnsuring: boolean;
  error: string | null;
  refreshDirectGroup: () => Promise<void>;
  ensureDirectGroup: () => Promise<ActionResult<string>>;
};

export function useDirectFriendGroup(
  friendId: string | undefined,
): UseDirectFriendGroupValue {
  const { user } = useAuth();
  const [directGroupId, setDirectGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnsuring, setIsEnsuring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDirectGroup = useCallback(async () => {
    if (!user?.id || !friendId) {
      setDirectGroupId(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const result = await getDirectFriendGroup(friendId);

    if (!result.ok) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    setDirectGroupId(result.data);
    setError(null);
    setIsLoading(false);
  }, [friendId, user?.id]);

  useFocusEffect(
    useCallback(() => {
      void refreshDirectGroup();
    }, [refreshDirectGroup]),
  );

  const ensureDirectGroup = useCallback(async (): Promise<
    ActionResult<string>
  > => {
    if (!user?.id) {
      return { ok: false, message: "Sign in to create a direct split." };
    }

    if (!friendId) {
      return { ok: false, message: "No friend selected." };
    }

    setIsEnsuring(true);

    const result = await ensureDirectFriendGroupRecord(friendId);

    setIsEnsuring(false);

    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    setDirectGroupId(result.data);
    setError(null);

    return { ok: true, data: result.data };
  }, [friendId, user?.id]);

  return {
    directGroupId,
    isLoading,
    isEnsuring,
    error,
    refreshDirectGroup,
    ensureDirectGroup,
  };
}
