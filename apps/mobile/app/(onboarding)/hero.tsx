import { Stack, useRouter } from "expo-router";
import { Text, View } from "react-native";
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
          gap: spacingTokens.xl,
          paddingBottom: spacingTokens.xxl,
          maxWidth: 360,
        }}
      >
        <Animated.View
          entering={getEntering(0)}
          style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: colorTokens.brand.primaryBorder,
            backgroundColor: colorTokens.brand.primarySoft,
            paddingHorizontal: spacingTokens.md,
            paddingVertical: spacingTokens.sm,
          }}
        >
          <Text
            style={[
              typographyTokens.label,
              {
                color: colorTokens.brand.primary,
              },
            ]}
          >
            tabbit
          </Text>
        </Animated.View>
        <Animated.Text
          entering={getEntering(80)}
          style={[
            typographyTokens.display,
            {
              color: colorTokens.text.primary,
            },
          ]}
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
              maxWidth: 320,
            },
          ]}
        >
          {onboardingContent.hero.subtitle}
        </Animated.Text>
      </View>
    </ScreenScaffold>
  );
}
