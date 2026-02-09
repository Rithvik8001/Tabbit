import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "@/design/primitives/sora-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useDirectFriendGroup } from "@/features/friends/hooks/use-direct-friend-group";
import { useFriendDetail } from "@/features/friends/hooks/use-friend-detail";
import { formatCents } from "@/features/groups/lib/format-currency";

type ActivityGroup = {
  monthLabel: string;
  items: {
    expenseId: string;
    description: string;
    netCents: number;
    groupName: string;
    groupEmoji: string | null;
    expenseDate: string;
    entryType: "expense" | "settlement";
  }[];
};

function monthLabel(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function shortDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(parsed);
}

export default function FriendDetailScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const router = useRouter();

  const { friend, activity, isLoading, error, refresh } =
    useFriendDetail(friendId);
  const { ensureDirectGroup, isEnsuring } = useDirectFriendGroup(friendId);

  const friendName = friend?.displayName ?? friend?.email ?? "Friend";
  const isSettled = friend?.direction === "settled";
  const isPositive = friend?.direction === "you_are_owed";

  const groupedActivity = useMemo<ActivityGroup[]>(() => {
    const map = new Map<string, ActivityGroup>();

    for (const item of activity) {
      const key = monthLabel(item.expenseDate);
      const current = map.get(key);

      if (current) {
        current.items.push(item);
        continue;
      }

      map.set(key, {
        monthLabel: key,
        items: [item],
      });
    }

    return Array.from(map.values());
  }, [activity]);

  const handleAddExpense = () => {
    if (!friend) {
      return;
    }

    void (async () => {
      const result = await ensureDirectGroup();

      if (!result.ok) {
        return;
      }

      router.push({
        pathname: "/(app)/(tabs)/(groups)/add-expense",
        params: { id: result.data },
      });
    })();
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: spacingTokens.xl,
        paddingTop: spacingTokens.sm,
        paddingBottom: spacingTokens["4xl"],
        gap: spacingTokens.md,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 40,
        }}
      >
        <Pressable onPress={() => router.back()}>
          {" "}
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colorSemanticTokens.text.secondary },
            ]}
          >
            Back
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ paddingTop: spacingTokens.xl, alignItems: "center" }}>
          {" "}
          <ActivityIndicator
            size="large"
            color={colorSemanticTokens.accent.primary}
          />
        </View>
      ) : null}

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
            {" "}
            {error}
          </Text>
          <Pressable onPress={() => void refresh()}>
            {" "}
            <Text
              selectable
              style={[
                typographyScale.headingSm,
                { color: colorSemanticTokens.accent.primary },
              ]}
            >
              {" "}
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!isLoading && !error && friend ? (
        <>
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
                typographyScale.displayMd,
                { color: colorSemanticTokens.text.primary },
              ]}
            >
              {friendName}
            </Text>

            <Text
              selectable
              style={[
                typographyScale.headingMd,
                {
                  color: isSettled
                    ? colorSemanticTokens.text.secondary
                    : isPositive
                      ? colorSemanticTokens.financial.positive
                      : colorSemanticTokens.financial.negative,
                },
              ]}
            >
              {isSettled
                ? "Settled up"
                : isPositive
                  ? "You are owed"
                  : "You owe"}
              {isSettled ? "" : ` ${formatCents(Math.abs(friend.netCents))}`}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacingTokens.sm }}
            >
              {" "}
              {!isSettled ? (
                <Pressable
                  onPress={() => {
                    router.push({
                      pathname: "/(app)/(tabs)/(friends)/settle-up",
                      params: { friendId: friend.userId },
                    });
                  }}
                  style={{
                    borderRadius: radiusTokens.pill,
                    borderCurve: "continuous",
                    backgroundColor: colorSemanticTokens.accent.primary,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    selectable
                    style={[
                      typographyScale.headingSm,
                      { color: colorSemanticTokens.text.inverse },
                    ]}
                  >
                    {" "}
                    Settle up
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={handleAddExpense}
                disabled={isEnsuring}
                style={{
                  borderRadius: radiusTokens.pill,
                  borderCurve: "continuous",
                  backgroundColor: colorSemanticTokens.background.subtle,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  opacity: isEnsuring ? 0.6 : 1,
                }}
              >
                <Text
                  selectable
                  style={[
                    typographyScale.headingSm,
                    { color: colorSemanticTokens.text.primary },
                  ]}
                >
                  {" "}
                  {isEnsuring ? "Starting..." : "Add expense"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>

          {groupedActivity.map((bucket) => (
            <View key={bucket.monthLabel} style={{ gap: spacingTokens.sm }}>
              {" "}
              <Text
                selectable
                style={[
                  typographyScale.headingMd,
                  { color: colorSemanticTokens.text.primary },
                ]}
              >
                {bucket.monthLabel}
              </Text>
              {bucket.items.map((item) => (
                <View
                  key={item.expenseId}
                  style={{
                    borderRadius: radiusTokens.card,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: colorSemanticTokens.border.subtle,
                    backgroundColor: colorSemanticTokens.surface.card,
                    padding: spacingTokens.md,
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: spacingTokens.sm,
                    }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      {" "}
                      <Text
                        selectable
                        style={[
                          typographyScale.headingMd,
                          { color: colorSemanticTokens.text.primary },
                        ]}
                      >
                        {item.description}
                      </Text>
                      <Text
                        selectable
                        style={[
                          typographyScale.bodySm,
                          { color: colorSemanticTokens.text.secondary },
                        ]}
                      >
                        {item.groupEmoji ? `${item.groupEmoji} ` : ""}
                        {item.groupName} · {shortDate(item.expenseDate)}
                      </Text>
                    </View>
                    <Text
                      selectable
                      style={[
                        typographyScale.headingMd,
                        {
                          color:
                            item.netCents > 0
                              ? colorSemanticTokens.financial.positive
                              : colorSemanticTokens.financial.negative,
                        },
                      ]}
                    >
                      {item.netCents > 0 ? "+" : "-"}
                      {formatCents(Math.abs(item.netCents))}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}
