import { useMemo, useState } from "react";
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
import { useFriendRequests } from "@/features/friends/hooks/use-friend-requests";
import { useFriends } from "@/features/friends/hooks/use-friends";
import type { FriendListRowVM } from "@/features/friends/types/friend.types";
import { formatCents } from "@/features/groups/lib/format-currency";
import { useHomeDashboard } from "@/features/home/hooks/use-home-dashboard";

function mapFriendRow(friend: {
  userId: string;
  displayName: string | null;
  email: string | null;
  netCents: number;
  direction: "you_owe" | "you_are_owed" | "settled";
}): FriendListRowVM {
  if (friend.direction === "you_owe") {
    return {
      id: friend.userId,
      title: friend.displayName ?? friend.email ?? "Unknown",
      subtitle: friend.email,
      statusLabel: "you owe",
      statusAmount: formatCents(Math.abs(friend.netCents)),
      tone: "negative",
    };
  }

  if (friend.direction === "you_are_owed") {
    return {
      id: friend.userId,
      title: friend.displayName ?? friend.email ?? "Unknown",
      subtitle: friend.email,
      statusLabel: "owes you",
      statusAmount: formatCents(Math.abs(friend.netCents)),
      tone: "positive",
    };
  }

  return {
    id: friend.userId,
    title: friend.displayName ?? friend.email ?? "Unknown",
    subtitle: friend.email,
    statusLabel: "settled up",
    statusAmount: null,
    tone: "neutral",
  };
}

export default function FriendsTabScreen() {
  const router = useRouter();
  const { snapshot } = useHomeDashboard({ activityLimit: 1 });
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

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [hideSettled, setHideSettled] = useState(false);

  const rows = useMemo(() => friends.map(mapFriendRow), [friends]);

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

  const hasErrors = Boolean(friendsError || requestsError);
  const isLoading = isFriendsLoading || isRequestsLoading;

  const refreshAll = async () => {
    await Promise.all([refreshFriends(), refreshRequests()]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer
        contentContainerStyle={{
          gap: spacingTokens.md,
          paddingBottom: spacingTokens["6xl"] + 120,
        }}
      >
        <TabTopActions
          rightActionLabel="Add friends"
          onRightActionPress={() => {
            router.push("/(app)/(tabs)/(friends)/add");
          }}
          onSearchPress={() => setShowSearch((current) => !current)}
        />

        {showSearch ? (
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search friends"
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

        {incomingRequests.length + outgoingRequests.length > 0 ? (
          <View
            style={{
              borderRadius: radiusTokens.card,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorSemanticTokens.border.subtle,
              backgroundColor: colorSemanticTokens.surface.card,
              padding: spacingTokens.md,
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
              Requests
            </Text>

            {incomingRequests.map((request) => (
              <View
                key={request.requestId}
                style={{
                  borderRadius: radiusTokens.control,
                  borderCurve: "continuous",
                  backgroundColor: colorSemanticTokens.background.subtle,
                  padding: spacingTokens.sm,
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
                  {request.displayName ?? request.email ?? "Unknown"}
                </Text>
                <View style={{ flexDirection: "row", gap: spacingTokens.sm }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Accept"
                      size="sm"
                      variant="soft"
                      onPress={() => {
                        void (async () => {
                          const result = await acceptRequest(request.requestId);
                          if (result.ok) {
                            await refreshFriends();
                          }
                        })();
                      }}
                      loading={isMutatingRequest(request.requestId)}
                      disabled={isMutatingRequest(request.requestId)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Decline"
                      size="sm"
                      variant="soft"
                      tone="danger"
                      onPress={() => {
                        void declineRequest(request.requestId);
                      }}
                      loading={isMutatingRequest(request.requestId)}
                      disabled={isMutatingRequest(request.requestId)}
                    />
                  </View>
                </View>
              </View>
            ))}

            {outgoingRequests.map((request) => (
              <View
                key={request.requestId}
                style={{
                  borderRadius: radiusTokens.control,
                  borderCurve: "continuous",
                  backgroundColor: colorSemanticTokens.background.subtle,
                  padding: spacingTokens.sm,
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
                  {request.displayName ?? request.email ?? "Unknown"}
                </Text>
                <Text
                  selectable
                  style={[
                    typographyScale.bodySm,
                    { color: colorSemanticTokens.text.secondary },
                  ]}
                >
                  Request sent
                </Text>
                <Button
                  label="Cancel request"
                  size="sm"
                  variant="soft"
                  tone="neutral"
                  onPress={() => {
                    void cancelRequest(request.requestId);
                  }}
                  loading={isMutatingRequest(request.requestId)}
                  disabled={isMutatingRequest(request.requestId)}
                />
              </View>
            ))}
          </View>
        ) : null}

        {hasErrors ? (
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
              Could not load friends
            </Text>
            {friendsError ? (
              <Text
                selectable
                style={[
                  typographyScale.bodySm,
                  { color: colorSemanticTokens.state.danger },
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
                  { color: colorSemanticTokens.state.danger },
                ]}
              >
                {requestsError}
              </Text>
            ) : null}
            <Button
              label="Retry"
              variant="soft"
              onPress={() => void refreshAll()}
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

        {!isLoading && filteredRows.length === 0 && !hasErrors ? (
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
              No friends yet
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodyMd,
                { color: colorSemanticTokens.text.secondary },
              ]}
            >
              Add your first friend to start splitting.
            </Text>
          </View>
        ) : null}

        {filteredRows.map((row) => (
          <Link
            key={row.id}
            href={{
              pathname: "/(app)/(tabs)/(friends)/[friendId]",
              params: { friendId: row.id },
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
                statusLabel={row.statusLabel}
                amountText={row.statusAmount ?? undefined}
                tone={row.tone}
              />
            </Pressable>
          </Link>
        ))}

        <Button
          label="Add more friends"
          variant="soft"
          onPress={() => {
            router.push("/(app)/(tabs)/(friends)/add");
          }}
        />
      </ScreenContainer>

      <FloatingAddExpenseCta
        onPress={() => {
          router.push("/(app)/add-expense-context");
        }}
      />
    </View>
  );
}
