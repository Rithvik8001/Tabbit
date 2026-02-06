import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";

import { PrimaryButton } from "@/design/primitives/primary-button";
import { ScreenScaffold } from "@/design/primitives/screen-scaffold";
import { colorTokens } from "@/design/tokens/color";
import { motionTokens } from "@/design/tokens/motion";
import { spacingTokens } from "@/design/tokens/spacing";
import { typographyTokens } from "@/design/tokens/typography";
import { onboardingContent } from "@/features/onboarding/config/onboarding-content";
import { OnboardingHeader } from "@/features/onboarding/components/onboarding-header";

export default function HeroScreen() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

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
        <PrimaryButton
          label="Continue"
          onPress={() => router.push("/(onboarding)/value")}
        />
      }
    >
      <Stack.Screen options={{ title: "Welcome" }} />
      <OnboardingHeader
        step={1}
        total={3}
        onSkip={() => router.replace("/(app)/home-preview")}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          gap: spacingTokens.lg,
          paddingBottom: spacingTokens.xxl,
        }}
      >
        <Animated.Text
          entering={getEntering(0)}
          style={[
            typographyTokens.display,
            {
              color: colorTokens.brand.primary,
              fontSize: 42,
              lineHeight: 46,
              letterSpacing: -1.2,
            },
          ]}
        >
          {onboardingContent.hero.brand}
        </Animated.Text>
        <Animated.Text
          entering={getEntering(80)}
          selectable
          style={[typographyTokens.title, { color: colorTokens.text.primary }]}
        >
          {onboardingContent.hero.title}
        </Animated.Text>
        <Animated.Text
          entering={getEntering(140)}
          selectable
          style={[
            typographyTokens.body,
            {
              color: colorTokens.text.secondary,
              maxWidth: 330,
            },
          ]}
        >
          {onboardingContent.hero.subtitle}
        </Animated.Text>
      </View>
    </ScreenScaffold>
  );
}
