import { Stack } from "expo-router";
import { useThemeColors } from "@/providers/theme-provider";

export default function SettingsTabLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.canvas },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="appearance" />
    </Stack>
  );
}
