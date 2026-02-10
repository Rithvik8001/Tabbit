import { Stack } from "expo-router";

export default function ActivityTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[expenseId]" />
    </Stack>
  );
}
