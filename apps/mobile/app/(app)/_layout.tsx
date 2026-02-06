import { Stack } from "expo-router";

import { colorTokens } from "@/design/tokens/color";

export default function AppShellLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade_from_bottom",
        headerShown: false,
        contentStyle: { backgroundColor: colorTokens.surface.base },
      }}
    >
      <Stack.Screen name="home-preview" />
    </Stack>
  );
}
