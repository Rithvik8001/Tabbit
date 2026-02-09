import { Stack } from "expo-router";

import { colorSemanticTokens } from "@/design/tokens/colors";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        headerShown: false,
        contentStyle: { backgroundColor: colorSemanticTokens.background.canvas },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
