import { Link } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Button } from "@/design/primitives/button";
import { LiquidSurface } from "@/design/primitives/liquid-surface";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { FRIENDS_RPC_UNAVAILABLE_MESSAGE } from "@/features/friends/lib/friends-repository";
import { useFriends } from "@/features/friends/hooks/use-friends";
import { formatCents } from "@/features/groups/lib/format-currency";

export default function FriendsTabScreen() {
  const { friends, isLoading, error, refresh } = useFriends();
  const showMigrationHint = error === FRIENDS_RPC_UNAVAILABLE_MESSAGE;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colorSemanticTokens.accent.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={{ gap: spacingTokens.sm }}>
      {error ? (
        <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding, gap: spacingTokens.sm }}>
          <Text selectable style={[typographyScale.headingSm, { color: colorSemanticTokens.text.primary }]}>
            {error}
          </Text>
          {showMigrationHint ? (
            <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.text.secondary }]}>
              If you are developing locally, run the latest Supabase migrations and retry.
            </Text>
          ) : null}
          <Button label="Retry" variant="soft" onPress={() => void refresh()} />
        </LiquidSurface>
      ) : null}

      {!error && friends.length === 0 ? (
        <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding }}>
          <Text selectable style={[typographyScale.bodyMd, { color: colorSemanticTokens.text.secondary }]}>
            No friends yet. Join or create a group to get started.
          </Text>
        </LiquidSurface>
      ) : null}

      {!error
        ? friends.map((friend) => {
            const isSettled = friend.direction === "settled";
            const isPositive = friend.direction === "you_are_owed";

            return (
              <Link
                key={friend.userId}
                href={{
                  pathname: "/(app)/(tabs)/(friends)/[friendId]",
                  params: { friendId: friend.userId },
                }}
                asChild
              >
                <Pressable>
                  <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding, gap: spacingTokens.xs }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: spacingTokens.sm,
                      }}
                    >
                      <Text
                        selectable
                        style={[typographyScale.headingMd, { color: colorSemanticTokens.text.primary }]}
                      >
                        {friend.displayName ?? friend.email ?? "Unknown"}
                      </Text>
                      <Text
                        selectable
                        style={[typographyScale.headingSm, { color: colorSemanticTokens.text.tertiary }]}
                      >
                        ›
                      </Text>
                    </View>

                    <Text
                      selectable
                      style={[
                        typographyScale.bodyMd,
                        {
                          color: isSettled
                            ? colorSemanticTokens.text.tertiary
                            : isPositive
                              ? colorSemanticTokens.financial.positive
                              : colorSemanticTokens.financial.negative,
                          fontVariant: ["tabular-nums"],
                        },
                      ]}
                    >
                      {isSettled
                        ? "Settled up"
                        : isPositive
                          ? `You are owed ${formatCents(Math.abs(friend.netCents))}`
                          : `You owe ${formatCents(Math.abs(friend.netCents))}`}
                    </Text>
                  </LiquidSurface>
                </Pressable>
              </Link>
            );
          })
        : null}
    </ScreenContainer>
  );
}
