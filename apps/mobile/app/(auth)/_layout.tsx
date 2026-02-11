import { Stack } from "expo-router";

import { useThemeColors } from "@/providers/theme-provider";

export default function AuthLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background.canvas },
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
