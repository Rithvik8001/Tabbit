import { Stack } from "expo-router";

import { colorTokens } from "@/design/tokens/color";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade",
        headerShown: false,
        contentStyle: { backgroundColor: colorTokens.surface.base },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
