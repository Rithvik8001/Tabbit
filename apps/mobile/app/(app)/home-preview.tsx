import { Stack, useRouter } from "expo-router";
import { Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";

import { GlassCard } from "@/design/primitives/glass-card";
import { GradientOrbBackground } from "@/design/primitives/gradient-orb-background";
import { PrimaryButton } from "@/design/primitives/primary-button";
import { colorTokens } from "@/design/tokens/color";
import { motionTokens } from "@/design/tokens/motion";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyTokens } from "@/design/tokens/typography";
import { useOnboardingStore } from "@/features/onboarding/state/onboarding.store";

export default function HomePreviewScreen() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { draft, resetDraft } = useOnboardingStore();

  const isCompact = height < 780;

  return (
    <GradientOrbBackground>
      <Stack.Screen options={{ title: "Preview Home" }} />

      <View
        style={{
          flex: 1,
          paddingTop: Math.max(insets.top, spacingTokens.xl),
          paddingHorizontal: spacingTokens.screenHorizontal,
          paddingBottom: Math.max(insets.bottom, spacingTokens.lg),
          gap: isCompact ? spacingTokens.lg : spacingTokens.xl,
        }}
      >
        <Animated.View
          entering={
            shouldReduceMotion
              ? undefined
              : FadeIn.duration(motionTokens.duration.transition)
          }
          style={{ gap: spacingTokens.xs }}
        >
          <Text
            selectable
            style={[typographyTokens.label, { color: colorTokens.text.secondary }]}
          >
            Tabbit Preview
          </Text>
          <Text
            selectable
            style={[
              typographyTokens.title,
              {
                color: colorTokens.text.primary,
                fontSize: isCompact ? 22 : typographyTokens.title.fontSize,
                lineHeight: isCompact ? 28 : typographyTokens.title.lineHeight,
              },
            ]}
          >
            Shared balances, beautifully clear.
          </Text>
        </Animated.View>

        <Animated.View
          entering={
            shouldReduceMotion
              ? undefined
              : FadeIn.duration(motionTokens.duration.transition).delay(80)
          }
          style={{ gap: isCompact ? spacingTokens.sm : spacingTokens.md }}
        >
          <GlassCard
            contentStyle={{
              gap: spacingTokens.md,
              backgroundColor: "rgba(255, 255, 255, 0.62)",
              padding: isCompact ? spacingTokens.lg : spacingTokens.xl,
            }}
          >
            <View style={{ gap: spacingTokens.xs }}>
              <Text
                selectable
                style={[typographyTokens.label, { color: colorTokens.text.secondary }]}
              >
                Total owed to you
              </Text>
              <Text
                selectable
                style={[
                  typographyTokens.display,
                  {
                    color: colorTokens.text.primary,
                    fontSize: isCompact ? 42 : typographyTokens.display.fontSize,
                    lineHeight: isCompact ? 46 : typographyTokens.display.lineHeight,
                    fontVariant: ["tabular-nums"],
                  },
                ]}
              >
                $248.40
              </Text>
            </View>
            <Text
              selectable
              style={[
                typographyTokens.body,
                { color: colorTokens.text.secondary },
              ]}
            >
              Style: {draft.splitStyle ?? "not set"} • Context:{" "}
              {draft.useContext ?? "not set"}
            </Text>
          </GlassCard>

          <GlassCard
            contentStyle={{
              gap: spacingTokens.md,
              backgroundColor: "rgba(255, 255, 255, 0.58)",
              padding: isCompact ? spacingTokens.lg : spacingTokens.xl,
            }}
          >
            <Text
              selectable
              style={[typographyTokens.label, { color: colorTokens.text.primary }]}
            >
              At a glance
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: spacingTokens.sm,
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 12,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: colorTokens.border.subtle,
                  backgroundColor: "rgba(255, 255, 255, 0.72)",
                  padding: spacingTokens.md,
                  gap: spacingTokens.xs,
                }}
              >
                <Text
                  selectable
                  style={[typographyTokens.caption, { color: colorTokens.text.muted }]}
                >
                  People involved
                </Text>
                <Text
                  selectable
                  style={[
                    typographyTokens.title,
                    {
                      color: colorTokens.text.primary,
                      fontSize: isCompact ? 20 : typographyTokens.title.fontSize,
                      lineHeight: isCompact ? 26 : typographyTokens.title.lineHeight,
                    },
                  ]}
                >
                  4
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  borderRadius: 12,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: colorTokens.border.subtle,
                  backgroundColor: "rgba(255, 255, 255, 0.72)",
                  padding: spacingTokens.md,
                  gap: spacingTokens.xs,
                }}
              >
                <Text
                  selectable
                  style={[
                    typographyTokens.caption,
                    { color: colorTokens.text.muted },
                  ]}
                >
                  Pending requests
                </Text>
                <Text
                  selectable
                  style={[
                    typographyTokens.title,
                    {
                      color: colorTokens.text.primary,
                      fontSize: isCompact ? 20 : typographyTokens.title.fontSize,
                      lineHeight: isCompact ? 26 : typographyTokens.title.lineHeight,
                    },
                  ]}
                >
                  2
                </Text>
              </View>
            </View>
            <View style={{ gap: spacingTokens.sm }}>
              {["Coffee run split equally", "Groceries split by exact amounts"].map(
                (row) => {
                  return (
                    <Text
                      key={row}
                      selectable
                      style={[
                        typographyTokens.body,
                        { color: colorTokens.text.secondary },
                      ]}
                    >
                      {row}
                    </Text>
                  );
                },
              )}
            </View>
          </GlassCard>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colorTokens.border.subtle,
            paddingTop: spacingTokens.md,
          }}
        >
          <PrimaryButton
            label="Restart Onboarding"
            variant="secondary"
            onPress={() => {
              resetDraft();
              router.replace("/(onboarding)");
            }}
          />
        </View>
      </View>
    </GradientOrbBackground>
  );
}
