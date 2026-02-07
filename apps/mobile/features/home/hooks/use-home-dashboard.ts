import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import {
  getHomeSnapshot,
  listHomeRecentActivity,
} from "@/features/home/lib/home-repository";
import type {
  HomeActivityItem,
  HomeSnapshot,
} from "@/features/home/types/home.types";

type UseHomeDashboardOptions = {
  activityLimit?: number;
};

type UseHomeDashboardValue = {
  snapshot: HomeSnapshot;
  activity: HomeActivityItem[];
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

export function useHomeDashboard(
  options: UseHomeDashboardOptions = {},
): UseHomeDashboardValue {
  const { activityLimit = 10 } = options;
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<HomeSnapshot>(EMPTY_SNAPSHOT);
  const [activity, setActivity] = useState<HomeActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setSnapshot(EMPTY_SNAPSHOT);
      setActivity([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const [snapshotResult, activityResult] = await Promise.all([
      getHomeSnapshot(),
      listHomeRecentActivity(activityLimit),
    ]);

    if (!snapshotResult.ok) {
      setError(snapshotResult.message);
      setIsLoading(false);
      return;
    }

    if (!activityResult.ok) {
      setError(activityResult.message);
      setIsLoading(false);
      return;
    }

    setSnapshot(snapshotResult.data);
    setActivity(activityResult.data);
    setError(null);
    setIsLoading(false);
  }, [activityLimit, user?.id]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return {
    snapshot,
    activity,
    isLoading,
    error,
    refresh,
  };
}
