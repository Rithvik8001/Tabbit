import { Stack } from "expo-router";

export default function FriendsTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Friends" }} />
      <Stack.Screen name="[friendId]" options={{ title: "Friend", headerLargeTitle: false }} />
      <Stack.Screen
        name="settle-up"
        options={{
          title: "Settle Up",
          headerLargeTitle: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
