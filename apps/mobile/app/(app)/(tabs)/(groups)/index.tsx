import { ScrollView, Text, View } from "react-native";

import {
  formatCurrency,
  formatShortDate,
  groupSummaries,
} from "@/features/app-shell/mock/tab-mock-data";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

function balanceLabel(
  direction: "you_owe" | "you_are_owed" | "settled",
  amount: number,
): string {
  if (direction === "settled") {
    return "All settled";
  }

  if (direction === "you_are_owed") {
    return `You are owed ${formatCurrency(amount)}`;
  }

  return `You owe ${formatCurrency(amount)}`;
}

export default function GroupsTabScreen() {
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
      {groupSummaries.map((group) => {
        const isPositive = group.direction === "you_are_owed";
        const isSettled = group.direction === "settled";

        return (
          <View
            key={group.id}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <Text
                selectable
                style={{ color: ink, fontSize: 20, lineHeight: 24, fontWeight: "700" }}
              >
                {group.name}
              </Text>
              <View
                style={{
                  borderRadius: 999,
                  borderCurve: "continuous",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  backgroundColor: isSettled
                    ? "#EEF2F7"
                    : isPositive
                      ? "#ECE9FF"
                      : "#F3F4F6",
                }}
              >
                <Text
                  selectable
                  style={{
                    color: isSettled ? muted : isPositive ? accent : ink,
                    fontSize: 12,
                    lineHeight: 16,
                    fontWeight: "700",
                  }}
                >
                  {isSettled ? "Settled" : isPositive ? "You are owed" : "You owe"}
                </Text>
              </View>
            </View>

            <Text
              selectable
              style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "500" }}
            >
              {group.members} members • Next due {formatShortDate(group.nextDueAt)}
            </Text>

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
              {balanceLabel(group.direction, group.balance)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
