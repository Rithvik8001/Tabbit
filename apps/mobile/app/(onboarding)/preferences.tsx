import { Stack, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";

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
import { OnboardingHeader } from "@/features/onboarding/components/onboarding-header";
import { useOnboardingStore } from "@/features/onboarding/state/onboarding.store";

export default function PreferencesScreen() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { draft, setSplitStyle, setUseContextValue } = useOnboardingStore();

  const canContinue = Boolean(draft.splitStyle && draft.useContext);

  const getEntering = (delay: number) => {
    if (shouldReduceMotion) {
      return undefined;
    }
    return FadeInDown.duration(motionTokens.duration.enter)
      .delay(delay)
      .springify()
      .damping(18);
  };

  return (
    <ScreenScaffold
      footer={
        <View style={{ gap: spacingTokens.sm }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={{ alignItems: "center", paddingVertical: spacingTokens.sm }}
          >
            <Text style={[typographyTokens.label, { color: colorTokens.text.secondary }]}>
              Back
            </Text>
          </Pressable>
          <PrimaryButton
            label="Enter Preview"
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
      <Stack.Screen options={{ title: "Preferences" }} />
      <OnboardingHeader step={3} total={3} onBack={() => router.back()} />

      <Animated.View entering={getEntering(0)} style={{ gap: spacingTokens.sm }}>
        <Text selectable style={[typographyTokens.title, { color: colorTokens.text.primary }]}>
          {onboardingContent.preferences.title}
        </Text>
        <Text selectable style={[typographyTokens.body, { color: colorTokens.text.secondary }]}>
          {onboardingContent.preferences.subtitle}
        </Text>
      </Animated.View>

      <Animated.View entering={getEntering(90)} style={{ gap: spacingTokens.sm }}>
        <Text selectable style={[typographyTokens.label, { color: colorTokens.text.primary }]}>
          Preferred split style
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacingTokens.sm }}>
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
      </Animated.View>

      <Animated.View entering={getEntering(160)} style={{ gap: spacingTokens.sm }}>
        <Text selectable style={[typographyTokens.label, { color: colorTokens.text.primary }]}>
          Primary context
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacingTokens.sm }}>
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
      </Animated.View>
    </ScreenScaffold>
  );
}
