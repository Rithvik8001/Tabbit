import { Stack } from "expo-router";
import { useThemeColors } from "@/providers/theme-provider";

export default function FriendsTabLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.canvas },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[friendId]" />
      <Stack.Screen
        name="add"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="settle-up"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
