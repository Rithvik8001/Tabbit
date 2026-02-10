import { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "@/design/primitives/sora-native";

import { BalanceListRow } from "@/design/primitives/balance-list-row";
import { Button } from "@/design/primitives/button";
import { FilterChipRow } from "@/design/primitives/filter-chip-row";
import { FloatingAddExpenseCta } from "@/design/primitives/floating-add-expense-cta";
import { OverallBalanceStrip } from "@/design/primitives/overall-balance-strip";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { TabTopActions } from "@/design/primitives/tab-top-actions";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useGroups } from "@/features/groups/hooks/use-groups";
import { formatCents } from "@/features/groups/lib/format-currency";
import { getGroupBalanceSummaries } from "@/features/groups/lib/groups-repository";
import type { GroupListRowVM } from "@/features/groups/types/group.types";
import { useHomeSnapshot } from "@/features/home/hooks/use-home-snapshot";
import {
  BALANCE_CHIPS,
  GROUP_SORT_CHIPS,
  matchesBalanceFilter,
  sortGroups,
  toneToDirection,
  type BalanceFilter,
  type GroupSort,
} from "@/features/shared/lib/list-filter-utils";

type GroupStatus = {
  statusState: "ready" | "loading" | "unavailable";
  statusLabel: string;
  statusAmount: string | null;
  tone: "positive" | "negative" | "neutral";
  netCents: number;
};

export default function GroupsTabScreen() {
  const router = useRouter();
  const { snapshot } = useHomeSnapshot();
  const { groups, isLoading, error, refresh } = useGroups();

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>("all");
  const [groupSort, setGroupSort] = useState<GroupSort>("newest");
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [statusByGroupId, setStatusByGroupId] = useState<
    Record<string, GroupStatus>
  >({});

  useEffect(() => {
    if (groups.length === 0) {
      setBalanceError(null);
      setStatusByGroupId({});
      return;
    }

    let isCancelled = false;
    const loadingStatuses = Object.fromEntries(
      groups.map((group) => [
        group.id,
        {
          statusState: "loading",
          statusLabel: "Calculating balance",
          statusAmount: null,
          tone: "neutral",
          netCents: 0,
        } satisfies GroupStatus,
      ]),
    );
    setStatusByGroupId(loadingStatuses);
    setBalanceError(null);

    void (async () => {
      if (isCancelled) {
        return;
      }

      const summaryResult = await getGroupBalanceSummaries();
      if (isCancelled) {
        return;
      }

      if (!summaryResult.ok) {
        setBalanceError(summaryResult.message);
        const unavailableStatuses = Object.fromEntries(
          groups.map((group) => [
            group.id,
            {
              statusState: "unavailable",
              statusLabel: "Balance unavailable",
              statusAmount: null,
              tone: "neutral",
              netCents: 0,
            } satisfies GroupStatus,
          ]),
        );
        setStatusByGroupId(unavailableStatuses);
        return;
      }

      const summaryByGroupId = new Map(
        summaryResult.data.map((summary) => [summary.groupId, summary]),
      );

      const statuses = Object.fromEntries(
        groups.map((group) => {
          const summary = summaryByGroupId.get(group.id);
          if (!summary) {
            return [
              group.id,
              {
                statusState: "unavailable",
                statusLabel: "Balance unavailable",
                statusAmount: null,
                tone: "neutral",
                netCents: 0,
              } satisfies GroupStatus,
            ] as const;
          }

          if (summary.direction === "you_owe") {
            return [
              group.id,
              {
                statusState: "ready",
                statusLabel: "you owe",
                statusAmount: formatCents(Math.abs(summary.netCents)),
                tone: "negative",
                netCents: summary.netCents,
              } satisfies GroupStatus,
            ] as const;
          }

          if (summary.direction === "you_are_owed") {
            return [
              group.id,
              {
                statusState: "ready",
                statusLabel: "you are owed",
                statusAmount: formatCents(Math.abs(summary.netCents)),
                tone: "positive",
                netCents: summary.netCents,
              } satisfies GroupStatus,
            ] as const;
          }

          return [
            group.id,
            {
              statusState: "ready",
              statusLabel: "settled up",
              statusAmount: null,
              tone: "neutral",
              netCents: 0,
            } satisfies GroupStatus,
          ] as const;
        }),
      );

      setStatusByGroupId(statuses);
      setBalanceError(null);
    })();

    return () => {
      isCancelled = true;
    };
  }, [groups]);

  type GroupRowWithMeta = GroupListRowVM & {
    netCents: number;
    createdAt: string;
    tone: "positive" | "negative" | "neutral";
  };

  const rows = useMemo<GroupRowWithMeta[]>(() => {
    return groups.map((group) => {
      const status = statusByGroupId[group.id] ?? {
        statusState: "loading" as const,
        statusLabel: "Calculating balance",
        statusAmount: null,
        tone: "neutral",
        netCents: 0,
      };

      return {
        id: group.id,
        title: group.name,
        subtitle: `${group.memberCount} ${group.memberCount === 1 ? "member" : "members"} · ${group.expenseCount} ${group.expenseCount === 1 ? "expense" : "expenses"}`,
        leadingEmoji: group.emoji,
        statusState: status.statusState,
        statusLabel: status.statusLabel,
        statusAmount: status.statusAmount,
        tone: status.tone,
        netCents: status.netCents,
        createdAt: group.createdAt,
      };
    });
  }, [groups, statusByGroupId]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      if (balanceFilter !== "all") {
        if (row.statusState !== "ready") {
          return false;
        }

        if (!matchesBalanceFilter(toneToDirection(row.tone), balanceFilter)) {
          return false;
        }
      }

      if (!normalized) return true;
      const haystack = `${row.title} ${row.subtitle ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });

    if (groupSort === "balance") {
      const readyRows = filtered.filter((row) => row.statusState === "ready");
      const pendingRows = filtered.filter((row) => row.statusState !== "ready");
      return [...sortGroups(readyRows, "balance"), ...sortGroups(pendingRows, "newest")];
    }

    return sortGroups(filtered, groupSort);
  }, [balanceFilter, groupSort, query, rows]);

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer
        contentContainerStyle={{
          gap: spacingTokens.md,
          paddingBottom: spacingTokens["6xl"] + 120,
        }}
      >
        <TabTopActions
          rightActionLabel="Create group"
          onRightActionPress={() => {
            router.push("/(app)/(tabs)/(groups)/create");
          }}
          onSearchPress={() => setShowSearch((current) => !current)}
        />

        {showSearch ? (
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search groups"
            placeholderTextColor={colorSemanticTokens.text.tertiary}
            selectionColor={colorSemanticTokens.accent.primary}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              typographyScale.bodyLg,
              {
                borderRadius: radiusTokens.control,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: colorSemanticTokens.border.subtle,
                backgroundColor: colorSemanticTokens.surface.card,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colorSemanticTokens.text.primary,
              },
            ]}
          />
        ) : null}

        <OverallBalanceStrip netBalanceCents={snapshot.netBalanceCents} />

        <View style={{ gap: spacingTokens.xs }}>
          <FilterChipRow
            chips={BALANCE_CHIPS}
            activeKey={balanceFilter}
            onSelect={setBalanceFilter}
          />
          <FilterChipRow
            chips={GROUP_SORT_CHIPS}
            activeKey={groupSort}
            onSelect={setGroupSort}
          />
        </View>

        {error ? (
          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorSemanticTokens.state.danger,
              backgroundColor: colorSemanticTokens.state.dangerSoft,
              padding: spacingTokens.md,
              gap: spacingTokens.sm,
            }}
          >
            <Text
              selectable
              style={[
                typographyScale.headingSm,
                { color: colorSemanticTokens.state.danger },
              ]}
            >
              Could not load groups
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodySm,
                { color: colorSemanticTokens.state.danger },
              ]}
            >
              {error}
            </Text>
            <Button
              label="Retry"
              variant="soft"
              onPress={() => void refresh()}
            />
          </View>
        ) : null}

        {balanceError && !error ? (
          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorSemanticTokens.state.warning,
              backgroundColor: colorSemanticTokens.state.warningSoft,
              padding: spacingTokens.md,
              gap: spacingTokens.sm,
            }}
          >
            <Text
              selectable
              style={[
                typographyScale.headingSm,
                { color: colorSemanticTokens.state.warning },
              ]}
            >
              Balances may be outdated
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodySm,
                { color: colorSemanticTokens.state.warning },
              ]}
            >
              {balanceError}
            </Text>
          </View>
        ) : null}

        {isLoading ? (
          <View
            style={{ alignItems: "center", paddingVertical: spacingTokens.md }}
          >
            <ActivityIndicator
              size="small"
              color={colorSemanticTokens.accent.primary}
            />
          </View>
        ) : null}

        {!isLoading && filteredRows.length === 0 && !error ? (
          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorSemanticTokens.border.subtle,
              backgroundColor: colorSemanticTokens.surface.card,
              padding: spacingTokens.cardPadding,
              gap: spacingTokens.sm,
            }}
          >
            <Text
              selectable
              style={[
                typographyScale.headingMd,
                { color: colorSemanticTokens.text.primary },
              ]}
            >
              {groups.length > 0
                ? "No groups match this filter"
                : "No groups yet"}
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodyMd,
                { color: colorSemanticTokens.text.secondary },
              ]}
            >
              {groups.length > 0
                ? "Try a different filter or search term."
                : "Start your first group to split shared costs."}
            </Text>
          </View>
        ) : null}

        {filteredRows.map((row) => (
          <Link
            key={row.id}
            href={{
              pathname: "/(app)/(tabs)/(groups)/[id]",
              params: { id: row.id },
            }}
            asChild
          >
            <Pressable
              style={{
                borderRadius: radiusTokens.card,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: colorSemanticTokens.border.subtle,
                backgroundColor: colorSemanticTokens.surface.card,
              }}
            >
              <BalanceListRow
                title={row.title}
                subtitle={row.subtitle ?? undefined}
                leadingEmoji={row.leadingEmoji ?? undefined}
                statusLabel={row.statusLabel}
                amountText={row.statusAmount ?? undefined}
                tone={row.tone}
              />
            </Pressable>
          </Link>
        ))}

        <Button
          label="Start a new group"
          variant="soft"
          onPress={() => {
            router.push("/(app)/(tabs)/(groups)/create");
          }}
        />
      </ScreenContainer>

      <FloatingAddExpenseCta
        onPress={() => {
          router.push({
            pathname: "/(app)/add-expense-context",
            params: { scope: "groups" },
          });
        }}
      />
    </View>
  );
}
