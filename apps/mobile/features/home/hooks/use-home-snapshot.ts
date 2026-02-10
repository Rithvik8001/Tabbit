import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import { getHomeSnapshot } from "@/features/home/lib/home-repository";
import type { HomeSnapshot } from "@/features/home/types/home.types";

type UseHomeSnapshotValue = {
  snapshot: HomeSnapshot;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const EMPTY_SNAPSHOT: HomeSnapshot = {
  netBalanceCents: 0,
  youOweCents: 0,
  youAreOwedCents: 0,
  unsettledGroupsCount: 0,
  activeGroupsCount: 0,
};

export function useHomeSnapshot(): UseHomeSnapshotValue {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<HomeSnapshot>(EMPTY_SNAPSHOT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setSnapshot(EMPTY_SNAPSHOT);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const snapshotResult = await getHomeSnapshot();

    if (!snapshotResult.ok) {
      setError(snapshotResult.message);
      setIsLoading(false);
      return;
    }

    setSnapshot(snapshotResult.data);
    setError(null);
    setIsLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return {
    snapshot,
    isLoading,
    error,
    refresh,
  };
}
