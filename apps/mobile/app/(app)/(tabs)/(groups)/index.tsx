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
import { FloatingAddExpenseCta } from "@/design/primitives/floating-add-expense-cta";
import { OverallBalanceStrip } from "@/design/primitives/overall-balance-strip";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { TabTopActions } from "@/design/primitives/tab-top-actions";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useAuth } from "@/features/auth/state/auth-provider";
import { useGroups } from "@/features/groups/hooks/use-groups";
import { listExpensesForGroup } from "@/features/groups/lib/expenses-repository";
import { formatCents } from "@/features/groups/lib/format-currency";
import type { GroupListRowVM } from "@/features/groups/types/group.types";
import { useHomeDashboard } from "@/features/home/hooks/use-home-dashboard";

type GroupStatus = {
  statusLabel: string;
  statusAmount: string | null;
  tone: "positive" | "negative" | "neutral";
};

function computeNetForUser(
  expenses: {
    paidBy: string;
    splits: { userId: string; shareCents: number }[];
  }[],
  userId: string,
): number {
  let net = 0;

  for (const expense of expenses) {
    if (expense.paidBy === userId) {
      for (const split of expense.splits) {
        if (split.userId !== userId) {
          net += split.shareCents;
        }
      }
      continue;
    }

    const currentUserSplit = expense.splits.find(
      (split) => split.userId === userId,
    );
    if (currentUserSplit) {
      net -= currentUserSplit.shareCents;
    }
  }

  return net;
}

export default function GroupsTabScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { snapshot } = useHomeDashboard({ activityLimit: 1 });
  const { groups, isLoading, error, refresh } = useGroups();

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [hideSettled, setHideSettled] = useState(false);
  const [statusByGroupId, setStatusByGroupId] = useState<
    Record<string, GroupStatus>
  >({});

  useEffect(() => {
    if (!user?.id || groups.length === 0) {
      setStatusByGroupId({});
      return;
    }

    let isCancelled = false;

    void (async () => {
      const entries = await Promise.all(
        groups.map(async (group) => {
          const result = await listExpensesForGroup(group.id);
          if (!result.ok) {
            return [
              group.id,
              {
                statusLabel: "status unavailable",
                statusAmount: null,
                tone: "neutral",
              } satisfies GroupStatus,
            ] as const;
          }

          const netCents = computeNetForUser(result.data, user.id);

          if (netCents < 0) {
            return [
              group.id,
              {
                statusLabel: "you owe",
                statusAmount: formatCents(Math.abs(netCents)),
                tone: "negative",
              } satisfies GroupStatus,
            ] as const;
          }

          if (netCents > 0) {
            return [
              group.id,
              {
                statusLabel: "you are owed",
                statusAmount: formatCents(Math.abs(netCents)),
                tone: "positive",
              } satisfies GroupStatus,
            ] as const;
          }

          return [
            group.id,
            {
              statusLabel: "settled up",
              statusAmount: null,
              tone: "neutral",
            } satisfies GroupStatus,
          ] as const;
        }),
      );

      if (isCancelled) {
        return;
      }

      setStatusByGroupId(Object.fromEntries(entries));
    })();

    return () => {
      isCancelled = true;
    };
  }, [groups, user?.id]);

  const rows = useMemo<GroupListRowVM[]>(() => {
    return groups.map((group) => {
      const status = statusByGroupId[group.id] ?? {
        statusLabel: "loading...",
        statusAmount: null,
        tone: "neutral",
      };

      return {
        id: group.id,
        title: group.name,
        subtitle: `${group.memberCount} ${group.memberCount === 1 ? "member" : "members"} · ${group.expenseCount} ${group.expenseCount === 1 ? "expense" : "expenses"}`,
        leadingEmoji: group.emoji,
        statusLabel: status.statusLabel,
        statusAmount: status.statusAmount,
        tone: status.tone,
      };
    });
  }, [groups, statusByGroupId]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (hideSettled && row.statusLabel === "settled up") {
        return false;
      }

      if (!normalized) {
        return true;
      }

      const haystack = `${row.title} ${row.subtitle ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [hideSettled, query, rows]);

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

        <OverallBalanceStrip
          netBalanceCents={snapshot.netBalanceCents}
          onFilterPress={() => setHideSettled((current) => !current)}
        />

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
              No groups yet
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodyMd,
                { color: colorSemanticTokens.text.secondary },
              ]}
            >
              Start your first group to split shared costs.
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
