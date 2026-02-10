import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/state/auth-provider";
import { listActivityFeedPage } from "@/features/activity/lib/activity-repository";
import type { ActivityFeedItem } from "@/features/activity/types/activity.types";

const DEFAULT_PAGE_SIZE = 25;

function mergeUniqueEvents(
  previous: ActivityFeedItem[],
  incoming: ActivityFeedItem[],
): ActivityFeedItem[] {
  if (incoming.length === 0) {
    return previous;
  }

  const byEventId = new Map(previous.map((item) => [item.eventId, item]));
  for (const item of incoming) {
    byEventId.set(item.eventId, item);
  }

  return Array.from(byEventId.values()).sort((left, right) => {
    const leftTime = new Date(left.occurredAt).getTime();
    const rightTime = new Date(right.occurredAt).getTime();
    const leftSafeTime = Number.isNaN(leftTime) ? 0 : leftTime;
    const rightSafeTime = Number.isNaN(rightTime) ? 0 : rightTime;

    if (rightSafeTime !== leftSafeTime) {
      return rightSafeTime - leftSafeTime;
    }

    return right.eventId.localeCompare(left.eventId);
  });
}

export function useActivityFeed(pageSize = DEFAULT_PAGE_SIZE) {
  const { user } = useAuth();
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setHasMore(false);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const result = await listActivityFeedPage(pageSize, 0);

    if (!result.ok) {
      setError(result.message);
      setIsLoading(false);
      return;
    }

    setItems(result.data);
    setHasMore(result.hasMore);
    setError(null);
    setIsLoading(false);
  }, [pageSize, user?.id]);

  const loadMore = useCallback(async () => {
    if (!user?.id || isLoading || isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);

    const result = await listActivityFeedPage(pageSize, items.length);

    if (!result.ok) {
      setError(result.message);
      setIsLoadingMore(false);
      return;
    }

    setItems((current) => mergeUniqueEvents(current, result.data));
    setHasMore(result.hasMore);
    setError(null);
    setIsLoadingMore(false);
  }, [hasMore, isLoading, isLoadingMore, items.length, pageSize, user?.id]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  };
}
