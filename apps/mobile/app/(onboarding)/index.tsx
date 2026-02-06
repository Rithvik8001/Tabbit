import { useRouter } from "expo-router";
import { Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";

import { GlassCard } from "@/design/primitives/glass-card";
import { OptionPill } from "@/design/primitives/option-pill";
import { PrimaryButton } from "@/design/primitives/primary-button";
import { ScreenScaffold } from "@/design/primitives/screen-scaffold";
import { colorTokens } from "@/design/tokens/color";
import { motionTokens } from "@/design/tokens/motion";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyTokens } from "@/design/tokens/typography";
import {
  onboardingContent,
  splitStyleOptions,
  useContextOptions,
} from "@/features/onboarding/config/onboarding-content";
import { useOnboardingStore } from "@/features/onboarding/state/onboarding.store";

export default function OnboardingScreen() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const { draft, setSplitStyle, setUseContextValue } = useOnboardingStore();

  const isCompact = height < 780;
  const canContinue = Boolean(draft.splitStyle && draft.useContext);

  return (
    <ScreenScaffold
      footerMode="docked"
      preferViewportFit
      contentContainerStyle={{
        paddingTop: isCompact ? spacingTokens.lg : spacingTokens.xl,
        paddingBottom: isCompact ? spacingTokens.lg : spacingTokens.xl,
      }}
      footer={
        <View style={{ gap: spacingTokens.sm }}>
          <Text
            selectable
            style={[
              typographyTokens.caption,
              { color: colorTokens.text.muted },
            ]}
          >
            {onboardingContent.cta.supportingNote}
          </Text>
          <PrimaryButton
            label={onboardingContent.cta.label}
            disabled={!canContinue}
            onPress={() => {
              if (!canContinue) {
                return;
              }
              router.replace("/(app)/home-preview");
            }}
          />
        </View>
      }
    >
      <Animated.View
        entering={
          shouldReduceMotion
            ? undefined
            : FadeIn.duration(motionTokens.duration.transition)
        }
        style={{
          flex: 1,
          justifyContent: isCompact ? "flex-start" : "center",
          gap: isCompact ? spacingTokens.xl : spacingTokens["3xl"],
        }}
      >
        <View
          style={{
            gap: spacingTokens.lg,
            maxWidth: 420,
          }}
        >
          <View
            style={{
              alignSelf: "flex-start",
              borderRadius: 999,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: colorTokens.border.subtle,
              backgroundColor: "rgba(255, 255, 255, 0.72)",
              paddingHorizontal: spacingTokens.md,
              paddingVertical: spacingTokens.sm,
            }}
          >
            <Text
              selectable
              style={[
                typographyTokens.label,
                { color: colorTokens.text.secondary },
              ]}
            >
              {onboardingContent.hero.kicker}
            </Text>
          </View>

          <Text
            selectable
            style={[
              typographyTokens.display,
              {
                color: colorTokens.text.primary,
                fontSize: isCompact ? 30 : 34,
                lineHeight: isCompact ? 36 : 40,
              },
            ]}
          >
            {onboardingContent.hero.title}
          </Text>
          <Text
            selectable
            style={[
              typographyTokens.body,
              {
                color: colorTokens.text.secondary,
                maxWidth: 360,
              },
            ]}
          >
            {onboardingContent.hero.subtitle}
          </Text>
        </View>

        <GlassCard
          intensity={18}
          contentStyle={{
            gap: isCompact ? spacingTokens.lg : spacingTokens.xl,
            backgroundColor: "rgba(255, 255, 255, 0.58)",
            padding: isCompact ? spacingTokens.lg : spacingTokens.xl,
          }}
        >
          <View style={{ gap: spacingTokens.sm }}>
            <Text
              selectable
              style={[
                typographyTokens.label,
                { color: colorTokens.text.primary },
              ]}
            >
              {onboardingContent.selectors.splitStyleLabel}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacingTokens.sm,
              }}
            >
              {splitStyleOptions.map((option) => {
                return (
                  <OptionPill
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    selected={draft.splitStyle === option.value}
                    onPress={setSplitStyle}
                  />
                );
              })}
            </View>
          </View>

          <View style={{ gap: spacingTokens.sm }}>
            <Text
              selectable
              style={[
                typographyTokens.label,
                { color: colorTokens.text.primary },
              ]}
            >
              {onboardingContent.selectors.contextLabel}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacingTokens.sm,
              }}
            >
              {useContextOptions.map((option) => {
                return (
                  <OptionPill
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    selected={draft.useContext === option.value}
                    onPress={setUseContextValue}
                  />
                );
              })}
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    </ScreenScaffold>
  );
}
