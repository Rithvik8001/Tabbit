import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Stack, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/design/primitives/button";
import { LiquidSurface } from "@/design/primitives/liquid-surface";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { FRIEND_REQUESTS_RPC_UNAVAILABLE_MESSAGE } from "@/features/friends/lib/friend-requests-repository";
import { FRIENDS_RPC_UNAVAILABLE_MESSAGE } from "@/features/friends/lib/friends-repository";
import { useFriendRequests } from "@/features/friends/hooks/use-friend-requests";
import { useFriends } from "@/features/friends/hooks/use-friends";
import { formatCents } from "@/features/groups/lib/format-currency";

function RequestRowSkeleton() {
  return (
    <LiquidSurface
      contentStyle={{
        padding: spacingTokens.cardPadding,
        gap: spacingTokens.xs,
      }}
    >
      <View
        style={{
          width: "55%",
          height: 14,
          borderRadius: 999,
          backgroundColor: "#E5E5E5",
        }}
      />
      <View
        style={{
          width: "72%",
          height: 12,
          borderRadius: 999,
          backgroundColor: "#E5E5E5",
        }}
      />
    </LiquidSurface>
  );
}

export default function FriendsTabScreen() {
  const router = useRouter();
  const {
    friends,
    isLoading: isFriendsLoading,
    error: friendsError,
    refresh: refreshFriends,
  } = useFriends();
  const {
    incomingRequests,
    outgoingRequests,
    isLoading: isRequestsLoading,
    error: requestsError,
    refresh: refreshRequests,
    acceptRequest,
    declineRequest,
    cancelRequest,
    isMutatingRequest,
  } = useFriendRequests();

  const isLoading = isFriendsLoading || isRequestsLoading;
  const hasFriendsError = Boolean(friendsError);
  const hasRequestsError = Boolean(requestsError);
  const hasErrors = hasFriendsError || hasRequestsError;

  const showMigrationHint =
    friendsError === FRIENDS_RPC_UNAVAILABLE_MESSAGE ||
    requestsError === FRIEND_REQUESTS_RPC_UNAVAILABLE_MESSAGE;

  const refreshAll = async () => {
    await Promise.all([refreshFriends(), refreshRequests()]);
  };

  const handleAccept = (requestId: string) => {
    void (async () => {
      const result = await acceptRequest(requestId);
      if (!result.ok) {
        return;
      }
      void refreshFriends();
    })();
  };

  const handleDecline = (requestId: string) => {
    void (async () => {
      const result = await declineRequest(requestId);
      if (!result.ok) {
        return;
      }
      void refreshFriends();
    })();
  };

  const handleCancel = (requestId: string) => {
    void (async () => {
      const result = await cancelRequest(requestId);
      if (!result.ok) {
        return;
      }
      void refreshFriends();
    })();
  };

  return (
    <ScreenContainer contentContainerStyle={{ gap: spacingTokens.sm }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add friend"
              onPress={() => {
                router.push("/(app)/(tabs)/(friends)/add");
              }}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: radiusTokens.pill,
                borderCurve: "continuous",
                backgroundColor: colorSemanticTokens.accent.soft,
                borderWidth: 1,
                borderColor: colorSemanticTokens.border.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FontAwesome
                name="plus"
                size={14}
                color={colorSemanticTokens.accent.primary}
              />
            </Pressable>
          ),
        }}
      />

      {isLoading ? (
        <>
          <RequestRowSkeleton />
          <RequestRowSkeleton />
          <RequestRowSkeleton />
        </>
      ) : null}

      {hasErrors ? (
        <LiquidSurface
          contentStyle={{
            padding: spacingTokens.cardPadding,
            gap: spacingTokens.sm,
          }}
        >
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colorSemanticTokens.text.primary },
            ]}
          >
            Could not load friends right now
          </Text>
          {friendsError ? (
            <Text
              selectable
              style={[
                typographyScale.bodySm,
                { color: colorSemanticTokens.text.secondary },
              ]}
            >
              {friendsError}
            </Text>
          ) : null}
          {requestsError ? (
            <Text
              selectable
              style={[
                typographyScale.bodySm,
                { color: colorSemanticTokens.text.secondary },
              ]}
            >
              {requestsError}
            </Text>
          ) : null}
          {showMigrationHint ? (
            <Text
              selectable
              style={[
                typographyScale.bodySm,
                { color: colorSemanticTokens.text.secondary },
              ]}
            >
              If you are developing locally, run the latest Supabase migrations
              and retry.
            </Text>
          ) : null}
          <Button
            label="Retry"
            variant="soft"
            onPress={() => void refreshAll()}
          />
        </LiquidSurface>
      ) : null}

      {!isLoading && !hasRequestsError && incomingRequests.length > 0 ? (
        <LiquidSurface
          contentStyle={{
            padding: spacingTokens.cardPadding,
            gap: spacingTokens.sm,
          }}
        >
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colorSemanticTokens.text.primary },
            ]}
          >
            Incoming requests
          </Text>
          {incomingRequests.map((request) => (
            <View
              key={request.requestId}
              style={{
                borderRadius: 14,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: colorSemanticTokens.border.subtle,
                backgroundColor: colorSemanticTokens.surface.cardStrong,
                padding: 12,
                gap: 8,
              }}
            >
              <View style={{ gap: 2 }}>
                <Text
                  selectable
                  style={[
                    typographyScale.headingSm,
                    { color: colorSemanticTokens.text.primary },
                  ]}
                >
                  {request.displayName ?? request.email ?? "Unknown"}
                </Text>
                {request.email ? (
                  <Text
                    selectable
                    style={[
                      typographyScale.bodySm,
                      { color: colorSemanticTokens.text.tertiary },
                    ]}
                  >
                    {request.email}
                  </Text>
                ) : null}
              </View>
              <View style={{ flexDirection: "row", gap: spacingTokens.xs }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Accept"
                    variant="soft"
                    tone="accent"
                    size="sm"
                    loading={isMutatingRequest(request.requestId)}
                    disabled={isMutatingRequest(request.requestId)}
                    onPress={() => {
                      handleAccept(request.requestId);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Decline"
                    variant="soft"
                    tone="danger"
                    size="sm"
                    loading={isMutatingRequest(request.requestId)}
                    disabled={isMutatingRequest(request.requestId)}
                    onPress={() => {
                      handleDecline(request.requestId);
                    }}
                  />
                </View>
              </View>
            </View>
          ))}
        </LiquidSurface>
      ) : null}

      {!isLoading && !hasRequestsError && outgoingRequests.length > 0 ? (
        <LiquidSurface
          contentStyle={{
            padding: spacingTokens.cardPadding,
            gap: spacingTokens.sm,
          }}
        >
          <Text
            selectable
            style={[
              typographyScale.headingSm,
              { color: colorSemanticTokens.text.primary },
            ]}
          >
            Sent requests
          </Text>
          {outgoingRequests.map((request) => (
            <View
              key={request.requestId}
              style={{
                borderRadius: 14,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: colorSemanticTokens.border.subtle,
                backgroundColor: colorSemanticTokens.surface.cardStrong,
                padding: 12,
                gap: 8,
              }}
            >
              <View style={{ gap: 2 }}>
                <Text
                  selectable
                  style={[
                    typographyScale.headingSm,
                    { color: colorSemanticTokens.text.primary },
                  ]}
                >
                  {request.displayName ?? request.email ?? "Unknown"}
                </Text>
                {request.email ? (
                  <Text
                    selectable
                    style={[
                      typographyScale.bodySm,
                      { color: colorSemanticTokens.text.tertiary },
                    ]}
                  >
                    {request.email}
                  </Text>
                ) : null}
              </View>
              <Button
                label="Cancel Request"
                variant="soft"
                tone="neutral"
                size="sm"
                loading={isMutatingRequest(request.requestId)}
                disabled={isMutatingRequest(request.requestId)}
                onPress={() => {
                  handleCancel(request.requestId);
                }}
              />
            </View>
          ))}
        </LiquidSurface>
      ) : null}

      {!isLoading &&
      !hasFriendsError &&
      !hasRequestsError &&
      friends.length === 0 &&
      incomingRequests.length === 0 &&
      outgoingRequests.length === 0 ? (
        <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding }}>
          <Text
            selectable
            style={[
              typographyScale.bodyMd,
              { color: colorSemanticTokens.text.secondary },
            ]}
          >
            No friends yet. Add a friend or join a group to get started.
          </Text>
        </LiquidSurface>
      ) : null}

      {!hasFriendsError
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
                  <LiquidSurface
                    contentStyle={{
                      padding: spacingTokens.cardPadding,
                      gap: spacingTokens.xs,
                    }}
                  >
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
                        style={[
                          typographyScale.headingMd,
                          { color: colorSemanticTokens.text.primary },
                        ]}
                      >
                        {friend.displayName ?? friend.email ?? "Unknown"}
                      </Text>
                      <Text
                        selectable
                        style={[
                          typographyScale.headingSm,
                          { color: colorSemanticTokens.text.tertiary },
                        ]}
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
