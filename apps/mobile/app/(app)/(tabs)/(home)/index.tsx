import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useHomeDashboard } from "@/features/home/hooks/use-home-dashboard";
import { formatCents } from "@/features/groups/lib/format-currency";

const surface = "#FFFFFF";
const stroke = "#E8ECF2";
const ink = "#0F172A";
const muted = "#5C6780";
const accent = "#4A29FF";
const success = "#15803D";
const danger = "#B03030";

function formatShortDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(parsed);
  } catch {
    return parsed.toISOString().slice(0, 10);
  }
}

function LoadingCard() {
  return (
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
      <View
        style={{
          width: "45%",
          height: 12,
          borderRadius: 999,
          backgroundColor: "#F1F4F8",
        }}
      />
      <View
        style={{
          width: "68%",
          height: 24,
          borderRadius: 999,
          backgroundColor: "#F1F4F8",
        }}
      />
    </View>
  );
}

export default function HomeTabScreen() {
  const { snapshot, activity, isLoading, error, refresh } = useHomeDashboard({
    activityLimit: 10,
  });

  const netBalanceColor =
    snapshot.netBalanceCents > 0
      ? success
      : snapshot.netBalanceCents < 0
        ? danger
        : ink;

  const metrics = [
    {
      label: "You Owe",
      value: formatCents(snapshot.youOweCents),
      valueColor: snapshot.youOweCents > 0 ? danger : ink,
    },
    {
      label: "You're Owed",
      value: formatCents(snapshot.youAreOwedCents),
      valueColor: snapshot.youAreOwedCents > 0 ? success : ink,
    },
    {
      label: "Unsettled Groups",
      value: String(snapshot.unsettledGroupsCount),
      valueColor: ink,
    },
    {
      label: "Active Groups",
      value: String(snapshot.activeGroupsCount),
      valueColor: ink,
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
      {isLoading ? (
        <>
          <LoadingCard />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {[0, 1, 2, 3].map((index) => (
              <View key={`home-metric-loading-${index}`} style={{ width: "48%" }}>
                <LoadingCard />
              </View>
            ))}
          </View>
          <LoadingCard />
        </>
      ) : null}

      {!isLoading ? (
        <>
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
              Net Balance
            </Text>
            <Text
              selectable
              style={{
                color: netBalanceColor,
                fontSize: 36,
                lineHeight: 40,
                letterSpacing: -0.6,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
              }}
            >
              {snapshot.netBalanceCents > 0
                ? `+${formatCents(snapshot.netBalanceCents)}`
                : formatCents(snapshot.netBalanceCents)}
            </Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {metrics.map((metric) => (
              <View
                key={metric.label}
                style={{
                  width: "48%",
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
                    color: metric.valueColor,
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

          {error ? (
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
                Could not refresh home dashboard
              </Text>
              <Text
                selectable
                style={{ color: muted, fontSize: 14, lineHeight: 18, fontWeight: "500" }}
              >
                {error}
              </Text>
              <Pressable
                onPress={() => {
                  void refresh();
                }}
                style={{
                  alignSelf: "flex-start",
                  borderRadius: 999,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: "#D7DDE8",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: "#F8FAFC",
                }}
              >
                <Text
                  selectable
                  style={{ color: ink, fontSize: 13, lineHeight: 16, fontWeight: "700" }}
                >
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : null}

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

            {activity.length === 0 ? (
              <Text
                selectable
                style={{
                  color: muted,
                  fontSize: 15,
                  lineHeight: 20,
                  fontWeight: "500",
                }}
              >
                No activity yet. Add an expense to see your balance changes.
              </Text>
            ) : (
              activity.map((item) => {
                const isPositive = item.direction === "you_are_owed";
                const isSettlement = item.entryType === "settlement";

                return (
                  <Link
                    key={item.expenseId}
                    href={{
                      pathname: "/(app)/(tabs)/(groups)/[id]",
                      params: { id: item.groupId },
                    }}
                    asChild
                  >
                    <Pressable
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
                          alignItems: "flex-start",
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
                                backgroundColor: "#ECE9FF",
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
                            color: isPositive ? success : danger,
                            fontSize: 16,
                            lineHeight: 20,
                            fontWeight: "700",
                            fontVariant: ["tabular-nums"],
                          }}
                        >
                          {isPositive ? "+" : "-"}
                          {formatCents(Math.abs(item.netCents))}
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
                        {item.groupEmoji ? `${item.groupEmoji} ` : ""}
                        {item.groupName} • {formatShortDate(item.expenseDate)}
                      </Text>
                    </Pressable>
                  </Link>
                );
              })
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
