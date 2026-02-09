import { Stack } from "expo-router";

import { colorSemanticTokens } from "@/design/tokens/colors";

export default function AppShellLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade_from_bottom",
        headerShown: false,
        contentStyle: { backgroundColor: colorSemanticTokens.background.canvas },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="home-preview" />
    </Stack>
  );
}
