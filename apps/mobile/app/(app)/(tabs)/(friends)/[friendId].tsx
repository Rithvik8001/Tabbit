import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import {
  findFriendProfile,
  formatCurrency,
} from "@/features/app-shell/mock/tab-mock-data";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

export default function FriendDetailScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const friendProfile = friendId ? findFriendProfile(friendId) : undefined;

  const balanceDirection = friendProfile?.direction === "you_are_owed";

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
          title: friendProfile?.name ?? "Friend",
          headerLargeTitle: false,
        }}
      />

      {!friendProfile ? (
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
                  color: balanceDirection ? accent : ink,
                  fontSize: 22,
                  lineHeight: 28,
                  fontWeight: "700",
                }}
              >
                {balanceDirection ? "You are owed" : "You owe"}
              </Text>
              <Text
                selectable
                style={{
                  color: balanceDirection ? accent : ink,
                  fontSize: 28,
                  lineHeight: 34,
                  fontWeight: "700",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatCurrency(friendProfile.balance)}
              </Text>
            </View>
          </View>

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

            {friendProfile.activity.map((item) => {
              const isPositive = item.direction === "you_are_owed";
              return (
                <View
                  key={item.id}
                  style={{
                    borderRadius: 14,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: stroke,
                    padding: 12,
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
                      style={{
                        flex: 1,
                        color: ink,
                        fontSize: 16,
                        lineHeight: 20,
                        fontWeight: "600",
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      selectable
                      style={{
                        color: isPositive ? accent : muted,
                        fontSize: 16,
                        lineHeight: 20,
                        fontWeight: "700",
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {isPositive ? "+" : "-"}
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}
