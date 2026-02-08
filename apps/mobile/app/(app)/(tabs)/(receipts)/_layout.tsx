import { Stack } from "expo-router";

export default function ReceiptsTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: false,
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Receipts" }} />
    </Stack>
  );
}
