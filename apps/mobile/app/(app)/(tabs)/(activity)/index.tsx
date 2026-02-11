import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Text,
  TextInput,
  View,
} from "@/design/primitives/sora-native";

import type { FilterChip } from "@/design/primitives/filter-chip-row";
import { BalanceListRow } from "@/design/primitives/balance-list-row";
import { Button } from "@/design/primitives/button";
import { FilterChipRow } from "@/design/primitives/filter-chip-row";
import { FloatingAddExpenseCta } from "@/design/primitives/floating-add-expense-cta";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { TabTopActions } from "@/design/primitives/tab-top-actions";
import { useThemeColors } from "@/providers/theme-provider";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useActivityFeed } from "@/features/activity/hooks/use-activity-feed";
import type {
  ActivityEventFilter,
  ActivityFeedItem,
  ActivityImpactFilter,
  ActivityRowVM,
} from "@/features/activity/types/activity.types";
import { formatCents } from "@/features/groups/lib/format-currency";

const EVENT_FILTER_CHIPS: readonly FilterChip<ActivityEventFilter>[] = [
  { key: "all", label: "All" },
  { key: "expense", label: "Expenses" },
  { key: "settlement", label: "Settlements" },
  { key: "group_joined", label: "Group updates" },
];

const IMPACT_FILTER_CHIPS: readonly FilterChip<ActivityImpactFilter>[] = [
  { key: "all", label: "All" },
  { key: "you_owe", label: "You owe" },
  { key: "owes_you", label: "Owes you" },
  { key: "no_impact", label: "No impact" },
];

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

function actorPrefix(name: string | null): string {
  return name ? `${name} ` : "";
}

function buildTitle(item: ActivityFeedItem): string {
  const actor = actorPrefix(item.actorDisplayName);

  if (item.eventType === "group_joined") {
    return `${actor}added you to "${item.groupName}"`;
  }

  if (item.eventType === "settlement") {
    return `${actor}recorded a payment`;
  }

  const desc = item.description || "Expense";
  return `${actor}added "${desc}"`;
}

function buildStatusLabel(item: ActivityFeedItem): {
  statusLabel: string;
  tone: "positive" | "negative" | "neutral";
} {
  if (item.eventType === "settlement") {
    return { statusLabel: "payment", tone: "neutral" };
  }

  if (item.eventType === "group_joined") {
    return { statusLabel: "", tone: "neutral" };
  }

  if (item.direction === "you_are_owed") {
    return { statusLabel: "you lent", tone: "positive" };
  }

  if (item.direction === "you_owe") {
    return { statusLabel: "you owe", tone: "negative" };
  }

  return { statusLabel: "not involved", tone: "neutral" };
}

function mapItemToRow(item: ActivityFeedItem): ActivityRowVM {
  const groupLabel = item.groupEmoji
    ? `${item.groupEmoji} ${item.groupName}`
    : item.groupName;

  const title = buildTitle(item);
  const { statusLabel, tone } = buildStatusLabel(item);
  const showAmount =
    item.eventType !== "group_joined" &&
    (item.direction === "you_owe" || item.direction === "you_are_owed");

  return {
    id: item.eventId,
    eventType: item.eventType,
    direction: item.direction,
    groupId: item.groupId,
    groupName: item.groupName,
    actorDisplayName: item.actorDisplayName,
    expenseId: item.expenseId,
    title,
    subtitle: groupLabel,
    timestampLabel: formatTimestamp(item.occurredAt),
    statusLabel,
    amountText: showAmount ? formatCents(Math.abs(item.netCents)) : undefined,
    hasReceipt: item.receiptAttached,
    tone,
  };
}

function matchesEventFilter(
  row: ActivityRowVM,
  eventFilter: ActivityEventFilter,
): boolean {
  if (eventFilter === "all") return true;
  return row.eventType === eventFilter;
}

function matchesImpactFilter(
  row: ActivityRowVM,
  impactFilter: ActivityImpactFilter,
): boolean {
  if (impactFilter === "all") return true;
  if (impactFilter === "you_owe") return row.direction === "you_owe";
  if (impactFilter === "owes_you") return row.direction === "you_are_owed";
  return row.direction === "settled";
}

export default function ActivityTabScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { items, isLoading, isLoadingMore, error, refresh, hasMore, loadMore } =
    useActivityFeed();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState<ActivityEventFilter>("all");
  const [impactFilter, setImpactFilter] = useState<ActivityImpactFilter>("all");

  const rows = useMemo(() => items.map(mapItemToRow), [items]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (!matchesEventFilter(row, eventFilter)) {
        return false;
      }

      if (!matchesImpactFilter(row, impactFilter)) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      const haystack = `${row.title} ${row.subtitle} ${row.actorDisplayName ?? ""} ${row.groupName} ${row.timestampLabel}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [eventFilter, impactFilter, query, rows]);

  const hasActiveFilters =
    eventFilter !== "all" || impactFilter !== "all" || query.trim().length > 0;

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer
        contentContainerStyle={{
          gap: spacingTokens.md,
          paddingBottom: spacingTokens["6xl"] + 120,
        }}
      >
        <TabTopActions
          onSearchPress={() => setShowSearch((current) => !current)}
        />

        {showSearch ? (
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search activity"
            placeholderTextColor={colors.text.tertiary}
            selectionColor={colors.accent.primary}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              typographyScale.bodyLg,
              {
                borderRadius: radiusTokens.control,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: colors.border.subtle,
                backgroundColor: colors.surface.card,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colors.text.primary,
              },
            ]}
          />
        ) : null}

        <View style={{ gap: spacingTokens.xs }}>
          <FilterChipRow
            chips={EVENT_FILTER_CHIPS}
            activeKey={eventFilter}
            onSelect={setEventFilter}
          />
          <FilterChipRow
            chips={IMPACT_FILTER_CHIPS}
            activeKey={impactFilter}
            onSelect={setImpactFilter}
          />
        </View>

        {error ? (
          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colors.state.danger,
              backgroundColor: colors.state.dangerSoft,
              padding: spacingTokens.md,
              gap: spacingTokens.sm,
            }}
          >
            <Text
              selectable
              style={[
                typographyScale.headingSm,
                { color: colors.state.danger },
              ]}
            >
              Could not load activity
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodySm,
                { color: colors.state.danger },
              ]}
            >
              {error}
            </Text>
            <Button label="Retry" variant="soft" onPress={() => void refresh()} />
          </View>
        ) : null}

        {isLoading ? (
          <View
            style={{ alignItems: "center", paddingVertical: spacingTokens.md }}
          >
            <ActivityIndicator
              size="small"
              color={colors.accent.primary}
            />
          </View>
        ) : null}

        {!isLoading && filteredRows.length === 0 ? (
          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colors.border.subtle,
              backgroundColor: colors.surface.card,
              padding: spacingTokens.cardPadding,
              gap: spacingTokens.sm,
            }}
          >
            <Text
              selectable
              style={[
                typographyScale.headingMd,
                { color: colors.text.primary },
              ]}
            >
              {hasActiveFilters ? "No activity matches this view" : "No activity yet"}
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodyMd,
                { color: colors.text.secondary },
              ]}
            >
              {hasActiveFilters
                ? "Try changing filters or search terms."
                : "Expenses, settlements, and group updates will appear here."}
            </Text>
          </View>
        ) : null}

        {filteredRows.map((row) => (
          <View
            key={row.id}
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colors.border.subtle,
              backgroundColor: colors.surface.card,
            }}
          >
            <BalanceListRow
              title={row.title}
              subtitle={`${row.subtitle} · ${row.timestampLabel}${row.hasReceipt ? " · Receipt attached" : ""}`}
              statusLabel={row.statusLabel}
              amountText={row.amountText}
              tone={row.tone}
              onPress={() => {
                if (
                  (row.eventType === "expense" || row.eventType === "settlement") &&
                  row.expenseId
                ) {
                  router.push({
                    pathname: "/(app)/(tabs)/(activity)/[expenseId]",
                    params: {
                      expenseId: row.expenseId,
                      groupId: row.groupId,
                      groupName: row.groupName,
                    },
                  });
                } else {
                  router.push({
                    pathname: "/(app)/(tabs)/(groups)/[id]",
                    params: { id: row.groupId },
                  });
                }
              }}
            />
          </View>
        ))}

        {hasMore ? (
          <Button
            label="View all activity"
            variant="soft"
            onPress={() => void loadMore()}
            loading={isLoadingMore}
            disabled={isLoadingMore}
          />
        ) : null}
      </ScreenContainer>

      <FloatingAddExpenseCta
        onPress={() => {
          router.push({
            pathname: "/(app)/add-expense-context",
            params: { scope: "all", returnTab: "activity" },
          });
        }}
      />
    </View>
  );
}
