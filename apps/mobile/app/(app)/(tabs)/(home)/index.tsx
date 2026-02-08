import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Badge } from "@/design/primitives/badge";
import { Button } from "@/design/primitives/button";
import { LiquidSurface } from "@/design/primitives/liquid-surface";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { SectionHeader } from "@/design/primitives/section-header";
import { StatTile } from "@/design/primitives/stat-tile";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { useHomeDashboard } from "@/features/home/hooks/use-home-dashboard";
import { formatCents } from "@/features/groups/lib/format-currency";

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

function LoadingShell() {
  return (
    <>
      <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding, gap: spacingTokens.md }}>
        <View
          style={{
            width: "38%",
            height: 12,
            borderRadius: 999,
            backgroundColor: "rgba(11, 17, 32, 0.08)",
          }}
        />
        <View
          style={{
            width: "62%",
            height: 34,
            borderRadius: 999,
            backgroundColor: "rgba(11, 17, 32, 0.08)",
          }}
        />
      </LiquidSurface>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacingTokens.sm }}>
        {[0, 1, 2, 3].map((item) => (
          <View key={`metric-loading-${item}`} style={{ width: "48%" }}>
            <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding, gap: spacingTokens.sm }}>
              <View
                style={{
                  width: "60%",
                  height: 11,
                  borderRadius: 999,
                  backgroundColor: "rgba(11, 17, 32, 0.08)",
                }}
              />
              <View
                style={{
                  width: "70%",
                  height: 23,
                  borderRadius: 999,
                  backgroundColor: "rgba(11, 17, 32, 0.08)",
                }}
              />
            </LiquidSurface>
          </View>
        ))}
      </View>
    </>
  );
}

export default function HomeTabScreen() {
  const { snapshot, activity, isLoading, error, refresh } = useHomeDashboard({
    activityLimit: 10,
  });

  const netBalanceColor =
    snapshot.netBalanceCents > 0
      ? colorSemanticTokens.financial.positive
      : snapshot.netBalanceCents < 0
        ? colorSemanticTokens.financial.negative
        : colorSemanticTokens.financial.neutral;

  return (
    <ScreenContainer contentContainerStyle={{ gap: spacingTokens.md }}>
      {isLoading ? <LoadingShell /> : null}

      {!isLoading ? (
        <>
          <LiquidSurface
            kind="strong"
            contentStyle={{
              padding: spacingTokens.cardPadding,
              gap: spacingTokens.xs,
            }}
          >
            <Text
              selectable
              style={[typographyScale.labelMd, { color: colorSemanticTokens.text.tertiary }]}
            >
              Net Balance
            </Text>
            <Text
              selectable
              style={[
                typographyScale.displayLg,
                { color: netBalanceColor, fontVariant: ["tabular-nums"] },
              ]}
            >
              {snapshot.netBalanceCents > 0
                ? `+${formatCents(snapshot.netBalanceCents)}`
                : formatCents(snapshot.netBalanceCents)}
            </Text>
          </LiquidSurface>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacingTokens.sm }}>
            <View style={{ width: "48%" }}>
              <StatTile
                label="You Owe"
                value={formatCents(snapshot.youOweCents)}
                tone={snapshot.youOweCents > 0 ? "negative" : "neutral"}
              />
            </View>
            <View style={{ width: "48%" }}>
              <StatTile
                label="You're Owed"
                value={formatCents(snapshot.youAreOwedCents)}
                tone={snapshot.youAreOwedCents > 0 ? "positive" : "neutral"}
              />
            </View>
            <View style={{ width: "48%" }}>
              <StatTile
                label="Unsettled Groups"
                value={String(snapshot.unsettledGroupsCount)}
                tone="neutral"
              />
            </View>
            <View style={{ width: "48%" }}>
              <StatTile
                label="Active Groups"
                value={String(snapshot.activeGroupsCount)}
                tone="neutral"
              />
            </View>
          </View>

          {error ? (
            <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding, gap: spacingTokens.sm }}>
              <Text selectable style={[typographyScale.headingSm, { color: colorSemanticTokens.text.primary }]}>
                Could not refresh home dashboard
              </Text>
              <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.text.secondary }]}>
                {error}
              </Text>
              <Button label="Try Again" variant="soft" onPress={() => void refresh()} />
            </LiquidSurface>
          ) : null}

          <LiquidSurface kind="strong" contentStyle={{ padding: spacingTokens.cardPadding, gap: spacingTokens.sm }}>
            <SectionHeader title="Recent Activity" />

            {activity.length === 0 ? (
              <Text selectable style={[typographyScale.bodyMd, { color: colorSemanticTokens.text.secondary }]}>
                No activity yet. Add an expense to see your balance changes.
              </Text>
            ) : (
              activity.map((item) => {
                const isPositive = item.direction === "you_are_owed";
                const amountColor = isPositive
                  ? colorSemanticTokens.financial.positive
                  : colorSemanticTokens.financial.negative;

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
                        borderRadius: 16,
                        borderCurve: "continuous",
                        borderWidth: 1,
                        borderColor: colorSemanticTokens.border.subtle,
                        backgroundColor: "rgba(255, 255, 255, 0.52)",
                        padding: spacingTokens.md,
                        gap: spacingTokens.xs,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: spacingTokens.sm,
                        }}
                      >
                        <View style={{ flex: 1, gap: spacingTokens.xxs }}>
                          <Text
                            selectable
                            style={[typographyScale.headingSm, { color: colorSemanticTokens.text.primary }]}
                          >
                            {item.description}
                          </Text>
                          {item.entryType === "settlement" ? <Badge label="Settlement" tone="accent" /> : null}
                        </View>
                        <Text
                          selectable
                          style={[
                            typographyScale.headingSm,
                            { color: amountColor, fontVariant: ["tabular-nums"] },
                          ]}
                        >
                          {isPositive ? "+" : "-"}
                          {formatCents(Math.abs(item.netCents))}
                        </Text>
                      </View>
                      <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.text.tertiary }]}>
                        {item.groupEmoji} {item.groupName} · {formatShortDate(item.expenseDate)}
                      </Text>
                    </Pressable>
                  </Link>
                );
              })
            )}
          </LiquidSurface>
        </>
      ) : null}
    </ScreenContainer>
  );
}
