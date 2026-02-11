import { Stack } from "expo-router";
import { useThemeColors } from "@/providers/theme-provider";

export default function GroupsTabLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.canvas },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="create"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="add-member"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="add-expense"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="edit-expense"
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
