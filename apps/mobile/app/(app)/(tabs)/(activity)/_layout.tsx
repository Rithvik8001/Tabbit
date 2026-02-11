import { Stack } from "expo-router";
import { useThemeColors } from "@/providers/theme-provider";

export default function ActivityTabLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.canvas },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[expenseId]" />
    </Stack>
  );
}
