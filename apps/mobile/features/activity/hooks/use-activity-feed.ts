import { useMemo, useState } from "react";

import { formatCents } from "@/features/groups/lib/format-currency";
import { useHomeDashboard } from "@/features/home/hooks/use-home-dashboard";
import type { ActivityRowVM } from "@/features/activity/types/activity.types";

const PAGE_STEP = 10;

function formatTimestamp(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(parsed);
  } catch {
    return parsed.toISOString().slice(0, 16).replace("T", " ");
  }
}

export function useActivityFeed(initialLimit = 20) {
  const [limit, setLimit] = useState(initialLimit);
  const { activity, isLoading, error, refresh } = useHomeDashboard({
    activityLimit: limit,
  });

  const rows = useMemo<ActivityRowVM[]>(() => {
    return activity.map((item) => {
      const isPositive = item.direction === "you_are_owed";
      const impactLabel = isPositive ? "you are owed" : "you owe";

      return {
        id: item.expenseId,
        groupId: item.groupId,
        title: item.description,
        subtitle: item.groupEmoji
          ? `${item.groupEmoji} ${item.groupName}`
          : item.groupName,
        timestampLabel: formatTimestamp(item.createdAt),
        impactLabel,
        impactAmount: formatCents(Math.abs(item.netCents)),
        tone: isPositive ? "positive" : "negative",
      };
    });
  }, [activity]);

  const canLoadMore = activity.length >= limit;

  const loadMore = () => {
    setLimit((current) => current + PAGE_STEP);
  };

  return {
    rows,
    isLoading,
    error,
    refresh,
    loadMore,
    canLoadMore,
  };
}
