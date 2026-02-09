import { Stack } from "expo-router";

export default function GroupsTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
