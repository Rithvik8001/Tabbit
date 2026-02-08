import { Link } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { FRIENDS_RPC_UNAVAILABLE_MESSAGE } from "@/features/friends/lib/friends-repository";
import { useFriends } from "@/features/friends/hooks/use-friends";
import { formatCents } from "@/features/groups/lib/format-currency";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

export default function FriendsTabScreen() {
  const { friends, isLoading, error, refresh } = useFriends();
  const showMigrationHint = error === FRIENDS_RPC_UNAVAILABLE_MESSAGE;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          gap: 12,
        }}
      >
        <Text style={{ color: ink, fontSize: 16, fontWeight: "600", textAlign: "center" }}>
          {error}
        </Text>
        {showMigrationHint ? (
          <Text
            style={{
              color: muted,
              fontSize: 14,
              lineHeight: 18,
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            If you are developing locally, run the latest Supabase migrations and retry.
          </Text>
        ) : null}
        <Pressable onPress={() => void refresh()}>
          <Text style={{ color: accent, fontSize: 16, fontWeight: "600" }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (friends.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ color: muted, fontSize: 16, fontWeight: "500", textAlign: "center" }}>
          No friends yet — join or create a group to get started.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 12,
      }}
    >
      {friends.map((friend) => {
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
            <Pressable
              style={{
                borderRadius: 20,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: stroke,
                backgroundColor: surface,
                padding: 16,
                gap: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <Text
                  selectable
                  style={{ color: ink, fontSize: 20, lineHeight: 24, fontWeight: "700" }}
                >
                  {friend.displayName ?? friend.email ?? "Unknown"}
                </Text>
                <Text
                  selectable
                  style={{ color: muted, fontSize: 20, lineHeight: 24, fontWeight: "600" }}
                >
                  ›
                </Text>
              </View>

              <Text
                selectable
                style={{
                  color: isSettled ? muted : isPositive ? accent : ink,
                  fontSize: 16,
                  lineHeight: 20,
                  fontWeight: "600",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {isSettled
                  ? "Settled up"
                  : isPositive
                    ? `You are owed ${formatCents(Math.abs(friend.netCents))}`
                    : `You owe ${formatCents(Math.abs(friend.netCents))}`}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </ScrollView>
  );
}
