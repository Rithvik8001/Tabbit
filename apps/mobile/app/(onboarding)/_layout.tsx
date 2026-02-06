import { Stack } from "expo-router";

import { colorTokens } from "@/design/tokens/color";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade_from_bottom",
        headerShown: false,
        contentStyle: { backgroundColor: colorTokens.surface.base },
      }}
    >
      <Stack.Screen name="hero" />
      <Stack.Screen name="value" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
