import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";

import { GlassCard } from "@/design/primitives/glass-card";
import { PrimaryButton } from "@/design/primitives/primary-button";
import { ScreenScaffold } from "@/design/primitives/screen-scaffold";
import { colorTokens } from "@/design/tokens/color";
import { motionTokens } from "@/design/tokens/motion";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyTokens } from "@/design/tokens/typography";
import {
  onboardingContent,
  valuePillars,
} from "@/features/onboarding/config/onboarding-content";
import { OnboardingHeader } from "@/features/onboarding/components/onboarding-header";

export default function ValueScreen() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const getEntering = (delay: number) => {
    if (shouldReduceMotion) {
      return undefined;
    }

    return FadeInDown.duration(motionTokens.duration.enter)
      .delay(delay)
      .springify()
      .damping(20);
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
            label="Next"
            onPress={() => router.push("/(onboarding)/preferences")}
          />
        </View>
      }
    >
      <Stack.Screen options={{ title: "Why Tabbit" }} />
      <OnboardingHeader
        step={2}
        total={3}
        onBack={() => router.back()}
        onSkip={() => router.replace("/(app)/home-preview")}
      />

      <Animated.View entering={getEntering(0)} style={{ gap: spacingTokens.sm }}>
        <Text selectable style={[typographyTokens.title, { color: colorTokens.text.primary }]}>
          {onboardingContent.value.title}
        </Text>
        <Text
          selectable
          style={[
            typographyTokens.body,
            {
              color: colorTokens.text.secondary,
            },
          ]}
        >
          {onboardingContent.value.subtitle}
        </Text>
      </Animated.View>

      <View style={{ gap: spacingTokens.lg }}>
        {valuePillars.map((pillar, index) => {
          return (
            <Animated.View entering={getEntering(120 + index * 40)} key={pillar.title}>
              <GlassCard
                contentStyle={{
                  gap: spacingTokens.md,
                  backgroundColor: "rgba(255, 255, 255, 0.44)",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colorTokens.brand.primarySoft,
                  }}
                >
                  <SymbolView
                    name={pillar.symbol}
                    tintColor={colorTokens.brand.primary}
                    size={20}
                    fallback={
                      <Text style={[typographyTokens.label, { color: colorTokens.brand.primary }]}>
                        {pillar.fallback}
                      </Text>
                    }
                  />
                </View>
                <View style={{ gap: spacingTokens.xs }}>
                  <Text
                    selectable
                    style={[typographyTokens.label, { color: colorTokens.text.primary }]}
                  >
                    {pillar.title}
                  </Text>
                  <Text
                    selectable
                    style={[typographyTokens.body, { color: colorTokens.text.secondary }]}
                  >
                    {pillar.description}
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>
          );
        })}
      </View>
    </ScreenScaffold>
  );
}
