import { Link, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/design/primitives/button";
import { LiquidSurface } from "@/design/primitives/liquid-surface";
import {
  HeaderPillButton,
  PageHeading,
} from "@/design/primitives/page-heading";
import { ScreenContainer } from "@/design/primitives/screen-container";
import { colorSemanticTokens } from "@/design/tokens/colors";
import { radiusTokens } from "@/design/tokens/radius";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyScale } from "@/design/tokens/typography";
import { GroupEmptyState } from "@/features/groups/components/group-empty-state";
import { getGroupTypeLabel } from "@/features/groups/constants/group-presets";
import { useGroups } from "@/features/groups/hooks/use-groups";

function LoadingGroupCard() {
  return (
    <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding, gap: spacingTokens.sm }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacingTokens.sm }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: radiusTokens.pill,
            backgroundColor: colorSemanticTokens.border.subtle,
          }}
        />
        <View style={{ flex: 1, gap: 8 }}>
          <View
            style={{
              width: "65%",
              height: 14,
              borderRadius: 999,
              backgroundColor: colorSemanticTokens.border.subtle,
            }}
          />
          <View
            style={{
              width: "38%",
              height: 12,
              borderRadius: 999,
              backgroundColor: colorSemanticTokens.border.subtle,
            }}
          />
        </View>
      </View>
    </LiquidSurface>
  );
}

export default function GroupsTabScreen() {
  const router = useRouter();
  const { groups, isLoading, error, refresh } = useGroups();

  const openCreateScreen = () => {
    router.push("/(app)/(tabs)/(groups)/create");
  };

  return (
    <ScreenContainer contentContainerStyle={{ gap: spacingTokens.md }}>
      <PageHeading
        title="Groups"
        subtitle="Split trips, rent, and every shared moment."
        trailing={
          <HeaderPillButton
            label="+ Group"
            onPress={openCreateScreen}
            tone="accent"
          />
        }
      />

      {isLoading
        ? [0, 1, 2].map((index) => <LoadingGroupCard key={`group-loading-${index}`} />)
        : null}

      {!isLoading && error ? (
        <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding, gap: spacingTokens.sm }}>
          <Text selectable style={[typographyScale.headingSm, { color: colorSemanticTokens.text.primary }]}>
            We could not load your groups
          </Text>
          <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.text.secondary }]}>
            {error}
          </Text>
          <Button label="Try Again" variant="soft" onPress={() => void refresh()} />
        </LiquidSurface>
      ) : null}

      {!isLoading && !error && groups.length === 0 ? (
        <GroupEmptyState onCreate={openCreateScreen} />
      ) : null}

      {!isLoading && !error
        ? groups.map((group) => (
            <Link
              key={group.id}
              href={{
                pathname: "/(app)/(tabs)/(groups)/[id]",
                params: { id: group.id },
              }}
              asChild
            >
              <Pressable>
                <LiquidSurface contentStyle={{ padding: spacingTokens.cardPadding, gap: spacingTokens.sm }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacingTokens.sm }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: radiusTokens.pill,
                        borderCurve: "continuous",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colorSemanticTokens.accent.soft,
                      }}
                    >
                      <Text selectable style={{ fontSize: 22, lineHeight: 26 }}>
                        {group.emoji}
                      </Text>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text
                        selectable
                        style={[typographyScale.headingMd, { color: colorSemanticTokens.text.primary }]}
                      >
                        {group.name}
                      </Text>
                      <Text
                        selectable
                        style={[typographyScale.bodySm, { color: colorSemanticTokens.text.tertiary }]}
                      >
                        {getGroupTypeLabel(group.groupType)} group
                      </Text>
                    </View>
                    <Text
                      selectable
                      style={[typographyScale.headingSm, { color: colorSemanticTokens.text.tertiary }]}
                    >
                      ›
                    </Text>
                  </View>

                  <Text selectable style={[typographyScale.bodySm, { color: colorSemanticTokens.text.secondary }]}>
                    {group.memberCount} {group.memberCount === 1 ? "member" : "members"} ·{" "}
                    {group.expenseCount === 0
                      ? "No expenses yet"
                      : `${group.expenseCount} ${group.expenseCount === 1 ? "expense" : "expenses"}`}
                  </Text>
                </LiquidSurface>
              </Pressable>
            </Link>
          ))
        : null}
    </ScreenContainer>
  );
}
