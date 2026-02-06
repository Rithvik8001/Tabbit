import { ScrollView, Text, View } from "react-native";

import {
  dashboardSnapshot,
  formatCurrency,
  formatShortDate,
} from "@/features/app-shell/mock/tab-mock-data";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";

export default function HomeTabScreen() {
  const metrics = [
    { label: "Due soon", value: formatCurrency(dashboardSnapshot.dueSoon) },
    { label: "Active groups", value: String(dashboardSnapshot.activeGroups) },
    {
      label: "Pending requests",
      value: String(dashboardSnapshot.pendingRequests),
    },
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 16,
      }}
    >
      <View
        style={{
          borderRadius: 20,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: stroke,
          backgroundColor: surface,
          padding: 18,
          gap: 8,
        }}
      >
        <Text
          selectable
          style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "600" }}
        >
          Total balance
        </Text>
        <Text
          selectable
          style={{
            color: ink,
            fontSize: 36,
            lineHeight: 40,
            letterSpacing: -0.6,
            fontWeight: "700",
            fontVariant: ["tabular-nums"],
          }}
        >
          {formatCurrency(dashboardSnapshot.totalBalance)}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {metrics.map((metric) => (
          <View
            key={metric.label}
            style={{
              flex: 1,
              borderRadius: 16,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: stroke,
              backgroundColor: surface,
              padding: 14,
              gap: 6,
            }}
          >
            <Text
              selectable
              style={{ color: muted, fontSize: 13, lineHeight: 16, fontWeight: "600" }}
            >
              {metric.label}
            </Text>
            <Text
              selectable
              style={{
                color: ink,
                fontSize: 20,
                lineHeight: 24,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
              }}
            >
              {metric.value}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          borderRadius: 20,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: stroke,
          backgroundColor: surface,
          padding: 18,
          gap: 12,
        }}
      >
        <Text
          selectable
          style={{ color: ink, fontSize: 20, lineHeight: 24, fontWeight: "700" }}
        >
          Recent activity
        </Text>

        {dashboardSnapshot.recentActivity.map((item) => {
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
                gap: 6,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
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
              <Text
                selectable
                style={{
                  color: muted,
                  fontSize: 14,
                  lineHeight: 18,
                  fontWeight: "500",
                }}
              >
                {item.groupName} • {formatShortDate(item.happenedAt)}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
