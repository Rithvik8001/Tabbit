import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { colorSemanticTokens } from "@/design/tokens/colors";
import { useFriendDetail } from "@/features/friends/hooks/use-friend-detail";
import { formatCents } from "@/features/groups/lib/format-currency";
import { formatShortDate } from "@/features/app-shell/mock/tab-mock-data";

const surface = colorSemanticTokens.surface.cardStrong;
const stroke = colorSemanticTokens.border.subtle;
const ink = colorSemanticTokens.text.primary;
const muted = colorSemanticTokens.text.secondary;
const accent = colorSemanticTokens.accent.primary;

export default function FriendDetailScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const router = useRouter();
  const { friend, activity, isLoading, error, refresh } = useFriendDetail(friendId);

  const friendName = friend?.displayName ?? friend?.email ?? "Friend";
  const isSettled = friend?.direction === "settled";
  const isPositive = friend?.direction === "you_are_owed";

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 24,
        gap: 12,
      }}
    >
      <Stack.Screen
        options={{
          title: friendName,
          headerLargeTitle: false,
        }}
      />

      {isLoading ? (
        <View style={{ paddingTop: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color={accent} />
        </View>
      ) : error ? (
        <View
          style={{
            borderRadius: 20,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: surface,
            padding: 16,
            gap: 12,
            alignItems: "center",
          }}
        >
          <Text
            selectable
            style={{ color: ink, fontSize: 16, fontWeight: "600", textAlign: "center" }}
          >
            {error}
          </Text>
          <Pressable onPress={() => void refresh()}>
            <Text style={{ color: accent, fontSize: 16, fontWeight: "600" }}>Retry</Text>
          </Pressable>
        </View>
      ) : !friend ? (
        <View
          style={{
            borderRadius: 20,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: stroke,
            backgroundColor: surface,
            padding: 16,
            gap: 6,
          }}
        >
          <Text
            selectable
            style={{ color: ink, fontSize: 20, lineHeight: 24, fontWeight: "700" }}
          >
            Friend not found
          </Text>
          <Text
            selectable
            style={{ color: muted, fontSize: 15, lineHeight: 20, fontWeight: "500" }}
          >
            Go back to Friends and choose an available profile.
          </Text>
        </View>
      ) : (
        <>
          {/* Balance card */}
          <View
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
            <Text
              selectable
              style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "600" }}
            >
              Current balance
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                rowGap: 6,
                columnGap: 12,
              }}
            >
              <Text
                selectable
                style={{
                  color: isSettled
                    ? muted
                    : isPositive
                      ? colorSemanticTokens.financial.positive
                      : colorSemanticTokens.financial.negative,
                  fontSize: 22,
                  lineHeight: 28,
                  fontWeight: "700",
                }}
              >
                {isSettled ? "Settled up" : isPositive ? "You are owed" : "You owe"}
              </Text>
              {!isSettled && (
                <Text
                  selectable
                  style={{
                    color: isPositive
                      ? colorSemanticTokens.financial.positive
                      : colorSemanticTokens.financial.negative,
                    fontSize: 28,
                    lineHeight: 34,
                    fontWeight: "700",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {formatCents(Math.abs(friend.netCents))}
                </Text>
              )}
            </View>
            {!isSettled ? (
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/(app)/(tabs)/(friends)/settle-up" as never,
                    params: { friendId: friend.userId } as never,
                  });
                }}
                style={{
                  marginTop: 4,
                  alignSelf: "flex-start",
                  borderRadius: 999,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: "rgba(50, 87, 226, 0.24)",
                  backgroundColor: colorSemanticTokens.accent.soft,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text
                  selectable
                  style={{
                    color: accent,
                    fontSize: 13,
                    lineHeight: 16,
                    fontWeight: "700",
                  }}
                >
                  Settle Up
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* Activity list */}
          <View
            style={{
              borderRadius: 20,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: stroke,
              backgroundColor: surface,
              padding: 16,
              gap: 10,
            }}
          >
            <Text
              selectable
              style={{ color: ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }}
            >
              Recent items
            </Text>

            {activity.length === 0 ? (
              <Text
                selectable
                style={{ color: muted, fontSize: 15, lineHeight: 20, fontWeight: "500" }}
              >
                No shared expenses yet.
              </Text>
            ) : (
              activity.map((item) => {
                const itemPositive = item.netCents > 0;
                const isSettlement = item.entryType === "settlement";
                return (
                  <View
                    key={item.expenseId}
                    style={{
                      borderRadius: 14,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: stroke,
                      padding: 12,
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text
                          selectable
                          style={{
                            color: ink,
                            fontSize: 16,
                            lineHeight: 20,
                            fontWeight: "600",
                          }}
                        >
                          {item.description}
                        </Text>
                        {isSettlement ? (
                          <View
                            style={{
                              alignSelf: "flex-start",
                              borderRadius: 999,
                              borderCurve: "continuous",
                              backgroundColor: colorSemanticTokens.accent.soft,
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                            }}
                          >
                            <Text
                              selectable
                              style={{
                                color: accent,
                                fontSize: 11,
                                lineHeight: 14,
                                fontWeight: "700",
                              }}
                            >
                              Settlement
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text
                        selectable
                        style={{
                          color: itemPositive ? accent : muted,
                          fontSize: 16,
                          lineHeight: 20,
                          fontWeight: "700",
                          fontVariant: ["tabular-nums"],
                        }}
                      >
                        {itemPositive ? "+" : "-"}
                        {formatCents(Math.abs(item.netCents))}
                      </Text>
                    </View>
                    <Text
                      selectable
                      style={{ color: muted, fontSize: 13, lineHeight: 16, fontWeight: "500" }}
                    >
                      {item.groupEmoji ? `${item.groupEmoji} ` : ""}
                      {item.groupName} · {formatShortDate(item.expenseDate)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
