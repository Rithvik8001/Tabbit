import { Stack } from "expo-router";

import { useThemeColors } from "@/providers/theme-provider";

export default function OnboardingLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.canvas },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
