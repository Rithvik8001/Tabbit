import { Stack } from "expo-router";

import { useThemeColors } from "@/providers/theme-provider";

export default function AppShellLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        animation: "fade_from_bottom",
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.canvas },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="home-preview" />
      <Stack.Screen
        name="add-expense-context"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="receipt-preview"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
