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
import { FilterChipRow } from "@/design/primitives/filter-chip-row";
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
import { useHomeSnapshot } from "@/features/home/hooks/use-home-snapshot";
import {
  BALANCE_CHIPS,
  FRIEND_SORT_CHIPS,
  matchesBalanceFilter,
  sortFriends,
  type BalanceFilter,
  type FriendSort,
} from "@/features/shared/lib/list-filter-utils";
import { getPersonLabel } from "@/features/shared/lib/person-label";

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
      title: getPersonLabel({
        displayName: friend.displayName,
        email: friend.email,
      }),
      subtitle: friend.email,
      statusLabel: "you owe",
      statusAmount: formatCents(Math.abs(friend.netCents)),
      tone: "negative",
    };
  }

  if (friend.direction === "you_are_owed") {
    return {
      id: friend.userId,
      title: getPersonLabel({
        displayName: friend.displayName,
        email: friend.email,
      }),
      subtitle: friend.email,
      statusLabel: "owes you",
      statusAmount: formatCents(Math.abs(friend.netCents)),
      tone: "positive",
    };
  }

  return {
    id: friend.userId,
    title: getPersonLabel({
      displayName: friend.displayName,
      email: friend.email,
    }),
    subtitle: friend.email,
    statusLabel: "settled up",
    statusAmount: null,
    tone: "neutral",
  };
}

export default function FriendsTabScreen() {
  const router = useRouter();
  const { snapshot } = useHomeSnapshot();
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
    actionError,
    refresh: refreshRequests,
    acceptRequest,
    declineRequest,
    cancelRequest,
    isMutatingRequest,
    clearActionError,
  } = useFriendRequests();

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>("all");
  const [friendSort, setFriendSort] = useState<FriendSort>("balance");

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const filtered = friends.filter((friend) => {
      if (!matchesBalanceFilter(friend.direction, balanceFilter)) return false;
      if (!normalized) return true;
      const haystack =
        `${friend.displayName ?? ""} ${friend.email ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });

    return sortFriends(filtered, friendSort).map(mapFriendRow);
  }, [balanceFilter, friendSort, friends, query]);

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

        <OverallBalanceStrip netBalanceCents={snapshot.netBalanceCents} />

        <View style={{ gap: spacingTokens.xs }}>
          <FilterChipRow
            chips={BALANCE_CHIPS}
            activeKey={balanceFilter}
            onSelect={setBalanceFilter}
          />
          <FilterChipRow
            chips={FRIEND_SORT_CHIPS}
            activeKey={friendSort}
            onSelect={setFriendSort}
          />
        </View>

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

            {actionError ? (
              <View
                style={{
                  borderRadius: radiusTokens.control,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: colorSemanticTokens.state.danger,
                  backgroundColor: colorSemanticTokens.state.dangerSoft,
                  padding: spacingTokens.sm,
                  gap: spacingTokens.xs,
                }}
              >
                <Text
                  selectable
                  style={[
                    typographyScale.bodySm,
                    { color: colorSemanticTokens.state.danger },
                  ]}
                >
                  {actionError}
                </Text>
                <Pressable
                  onPress={clearActionError}
                  accessibilityRole="button"
                  style={{ alignSelf: "flex-start" }}
                >
                  <Text
                    selectable
                    style={[
                      typographyScale.headingSm,
                      { color: colorSemanticTokens.state.danger },
                    ]}
                  >
                    Dismiss
                  </Text>
                </Pressable>
              </View>
            ) : null}

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
                  {getPersonLabel({
                    displayName: request.displayName,
                    email: request.email,
                  })}
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
                        void (async () => {
                          await declineRequest(request.requestId);
                        })();
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
                  {getPersonLabel({
                    displayName: request.displayName,
                    email: request.email,
                  })}
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
                    void (async () => {
                      await cancelRequest(request.requestId);
                    })();
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
              {friends.length > 0
                ? "No friends match this filter"
                : "No friends yet"}
            </Text>
            <Text
              selectable
              style={[
                typographyScale.bodyMd,
                { color: colorSemanticTokens.text.secondary },
              ]}
            >
              {friends.length > 0
                ? "Try a different filter or search term."
                : "Add your first friend to start splitting."}
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
          router.push({
            pathname: "/(app)/add-expense-context",
            params: { scope: "friends" },
          });
        }}
      />
    </View>
  );
}
