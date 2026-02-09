import { Stack } from "expo-router";

import { colorSemanticTokens } from "@/design/tokens/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colorSemanticTokens.background.canvas },
      }}
    >
      <Stack.Screen name="login" options={{ presentation: "card" }} />
      <Stack.Screen name="signup" options={{ presentation: "card" }} />
      <Stack.Screen name="verify-signup-otp" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
