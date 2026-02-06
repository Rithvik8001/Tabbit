import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import {
  friendBalances,
  formatCurrency,
} from "@/features/app-shell/mock/tab-mock-data";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

export default function FriendsTabScreen() {
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
      {friendBalances.map((friend) => {
        const isPositive = friend.direction === "you_are_owed";

        return (
          <Link
            key={friend.id}
            href={{
              pathname: "/(app)/(tabs)/(friends)/[friendId]",
              params: { friendId: friend.id },
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
                  {friend.name}
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
                  color: isPositive ? accent : ink,
                  fontSize: 16,
                  lineHeight: 20,
                  fontWeight: "600",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {isPositive ? "You are owed " : "You owe "}
                {formatCurrency(friend.amount)}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </ScrollView>
  );
}
