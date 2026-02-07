import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import {
  getFriendActivity,
  listFriendBalances,
} from "@/features/friends/lib/friends-repository";
import type {
  FriendActivityItem,
  FriendBalance,
} from "@/features/friends/types/friend.types";

type UseFriendDetailValue = {
  friend: FriendBalance | null;
  activity: FriendActivityItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useFriendDetail(friendId: string | undefined): UseFriendDetailValue {
  const { user } = useAuth();
  const [friend, setFriend] = useState<FriendBalance | null>(null);
  const [activity, setActivity] = useState<FriendActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id || !friendId) {
      setFriend(null);
      setActivity([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const [balancesResult, activityResult] = await Promise.all([
      listFriendBalances(),
      getFriendActivity(friendId),
    ]);

    if (!balancesResult.ok) {
      setError(balancesResult.message);
      setIsLoading(false);
      return;
    }

    if (!activityResult.ok) {
      setError(activityResult.message);
      setIsLoading(false);
      return;
    }

    const match = balancesResult.data.find((f) => f.userId === friendId) ?? null;
    setFriend(match);
    setActivity(activityResult.data);
    setError(null);
    setIsLoading(false);
  }, [user?.id, friendId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { friend, activity, isLoading, error, refresh };
}
