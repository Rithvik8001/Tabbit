import { Stack } from "expo-router";

export default function GroupsTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Groups" }} />
      <Stack.Screen
        name="create"
        options={{
          title: "New Group",
          headerLargeTitle: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
