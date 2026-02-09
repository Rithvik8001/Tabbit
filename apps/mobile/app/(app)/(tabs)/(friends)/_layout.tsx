import { Stack } from "expo-router";

export default function FriendsTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
