import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import { listFriendBalances } from "@/features/friends/lib/friends-repository";
import type { FriendBalance } from "@/features/friends/types/friend.types";

type UseFriendsValue = {
  friends: FriendBalance[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useFriends(): UseFriendsValue {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setFriends([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const result = await listFriendBalances();

    if (!result.ok) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    setFriends(result.data);
    setError(null);
    setIsLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { friends, isLoading, error, refresh };
}
