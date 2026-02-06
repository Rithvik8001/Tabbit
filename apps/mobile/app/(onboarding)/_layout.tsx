import { Stack } from "expo-router";

import { colorTokens } from "@/design/tokens/color";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        headerShown: false,
        contentStyle: { backgroundColor: colorTokens.surface.base },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
